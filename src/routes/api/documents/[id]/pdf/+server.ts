import {sql} from 'kysely';
import {read} from '$app/server';
import {error} from '@sveltejs/kit';
import fontkit from '@pdf-lib/fontkit';
import {kysely} from '$lib/kysely/kysely';
import {formatDate} from '$lib/helpers/formatDate';
import {grayscale, PDFDocument, PDFFont} from 'pdf-lib';
import type {Clients} from '$lib/kysely/gen/public/Clients';
import type {Companies} from '$lib/kysely/gen/public/Companies';

import BricolageGrotesque from './fonts/BricolageGrotesque-Regular.ttf';
import BricolageGrotesqueBold from './fonts/BricolageGrotesque-Bold.ttf';

const pageMargin = 50;
const lineHeight = 20;

export async function GET({params}) {
    const document = await kysely
        .selectFrom('public.documents')
        .select([
            'public.documents.id',
            'public.documents.status',
            'public.documents.lines',
            'public.documents.name',
            'public.documents.note',
            'public.documents.number',
            'public.documents.emittedAt',
            'public.documents.quantityBase',
            'public.documents.quantityLabel',
            'public.documents.organizationId',
            'public.documents.type',
            'public.documents.createdAt',
            'public.documents.updatedAt',
            'public.documents.companyId',
            'public.documents.clientId',
            sql<Companies>`json_agg(companies)->0`.as('company'),
            sql<Clients>`json_agg(clients)->0`.as('client'),
        ])
        .leftJoin('public.companies', 'public.companies.id', 'public.documents.companyId')
        .leftJoin('public.clients', 'public.clients.id', 'public.documents.clientId')
        .where('public.documents.id', '=', parseInt(params.id))
        .groupBy('public.documents.id')
        .executeTakeFirst();

    if (document === undefined) {
        throw error(404, `This document doesn't exist`);
    }

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const font = await pdf.embedFont(await read(BricolageGrotesque).arrayBuffer());
    const fontBold = await pdf.embedFont(await read(BricolageGrotesqueBold).arrayBuffer());

    const page = pdf.addPage();

    // company
    const company = document.company;
    page.moveTo(pageMargin, page.getHeight() - pageMargin);
    page.drawText(company.name, {font: fontBold, size: 12});
    page.moveDown(lineHeight);
    for (const line of company.address.split('\n')) {
        page.drawText(line, {font, size: 12});
        page.moveDown(lineHeight);
    }
    page.moveDown(lineHeight / 2);
    if (company.phone) {
        page.drawText(company.phone, {font, size: 12});
        page.moveDown(lineHeight);
    }
    if (company.email) {
        page.drawText(company.email, {font, size: 12});
        page.moveDown(lineHeight);
    }
    page.moveDown(lineHeight / 2);
    page.drawText(`SIREN : ${company.siren}`, {font, size: 12});
    page.moveDown(lineHeight);
    page.drawText(`Date d'émission : ${formatDate(document.emittedAt)}`, {font, size: 12});

    // client
    const client = document.client;

    page.moveTo(page.getWidth() - fontBold.widthOfTextAtSize(client.name, 12) - pageMargin, page.getHeight() - 150);
    page.drawText(client.name, {font: fontBold, size: 12});
    let y = page.getHeight() - 170;
    for (const line of client.address.split('\n')) {
        page.moveTo(page.getWidth() - fontBold.widthOfTextAtSize(line, 12) - pageMargin, y);
        y -= lineHeight;
        page.drawText(line, {font, size: 12});
    }

    // infos
    const title = `Facture nº${document.number} : ${document.name}`;
    page.moveTo(50, page.getHeight() - 260);
    page.drawText(title, {font: fontBold, size: 20});

    const priceWidth = 100;
    const rowHeight = 25;
    const rowPadding = 8;

    function drawTextWithRect(text: string, font: PDFFont, rect: {x: number; y: number; width: number; height: number}) {
        page.drawRectangle({
            ...rect,
            borderColor: grayscale(0.8),
            borderWidth: 1,
        });
        page.drawText(text, {
            x: rect.x + rowPadding,
            y: rect.y + rowPadding,
            size: 12,
            font,
        });
    }

    y = page.getHeight() - 300;
    drawTextWithRect('Description', fontBold, {
        x: pageMargin,
        y,
        width: page.getWidth() - pageMargin * 2 - priceWidth,
        height: rowHeight,
    });

    drawTextWithRect('Prix (HT)', fontBold, {
        x: page.getWidth() - pageMargin - priceWidth,
        y,
        width: priceWidth,
        height: rowHeight,
    });

    y -= rowHeight;
    for (const {price, description} of document.lines) {
        const lineCount = description.split('\n').length;
        page.drawRectangle({
            x: pageMargin,
            y: y - rowHeight * (lineCount - 1),
            width: page.getWidth() - pageMargin * 2 - priceWidth,
            height: rowHeight * lineCount,
            borderColor: grayscale(0.8),
            borderWidth: 1,
        });

        page.drawText(description, {
            x: pageMargin + rowPadding,
            y: y + rowPadding,
            size: 12,
            font,
        });

        page.drawRectangle({
            x: page.getWidth() - pageMargin - priceWidth,
            y: y - rowHeight * (lineCount - 1),
            width: priceWidth,
            height: rowHeight * lineCount,
            borderColor: grayscale(0.8),
            borderWidth: 1,
        });

        page.drawText(`${price} €`, {
            x: page.getWidth() - pageMargin - priceWidth + rowPadding,
            y: y + rowPadding,
            size: 12,
            font,
        });
        y -= rowHeight * lineCount;
    }

    const totalText = `Total (HT) : ${document.lines.reduce((total, line) => total + line.price, 0)} €`;
    page.moveTo(page.getWidth() - fontBold.widthOfTextAtSize(totalText, 12) - pageMargin, y);
    page.drawText(totalText, {font: fontBold, size: 12});
    page.moveTo(page.getWidth() - font.widthOfTextAtSize('TVA Non applicable', 12) - pageMargin, y - lineHeight);
    page.drawText('TVA Non applicable', {font, size: 12});

    // payment infos
    page.moveTo(pageMargin, y - 50);
    page.drawText(`Informations de paiement`, {font: fontBold, size: 14});
    page.moveDown(lineHeight);
    page.drawText(`BIC : ${company.bic}`, {font, size: 12});
    page.moveDown(lineHeight);
    page.drawText(`IBAN : ${company.iban}`, {font, size: 12});

    const bytes = await pdf.save();

    return new Response(await pdf.save(), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': bytes.byteLength.toString(),
            'Content-Disposition': `attachment; filename="facture-n${document.number}-${document.name.replace(' ', '-').toLowerCase()}.pdf"`,
        },
    });
}
