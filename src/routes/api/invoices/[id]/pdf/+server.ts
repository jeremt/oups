import {read} from '$app/server';
import fontkit from '@pdf-lib/fontkit';
import {formatDate} from '$lib/helpers/formatDate';
import {grayscale, PDFDocument, PDFFont} from 'pdf-lib';
import type {Invoice} from '$lib/pocketbase/pocketbase';

import BricolageGrotesque from './fonts/BricolageGrotesque-Regular.ttf';
import BricolageGrotesqueBold from './fonts/BricolageGrotesque-Bold.ttf';

const pageMargin = 50;
const lineHeight = 20;

export async function GET() {
    const invoice = {
        id: 'osef-invoice',
        client_id: 'osef-client',
        company_id: 'osef-company',
        created: new Date().toString(),
        emission_date: new Date().toString(),
        lines: [
            {price: 3200, description: 'Encadrement'},
            {price: 150, description: 'Réunions'},
            {price: 540, description: 'Mentorats'},
            {
                price: 12000,
                description: `Un truc un peu compliqué :
- qui doit être sur plusieurs lignes
- pour tout expliquer dans le détail
- ça passe en vrai`,
            },
            {price: 540, description: 'Mentorats'},
        ],
        name: 'Encadrement',
        number: 15,
        status: 'generated',
        expand: {
            client_id: {
                id: 'osef-client',
                created: new Date().toString(),
                name: 'Ada Tech School',
                address: '28 rue du Petit Musc\n75004 Paris',
                company_id: 'osef-company',
            },
            company_id: {
                id: 'osef-company',
                current_invoice_number: 14,
                current_quote_number: 1,
                created: new Date().toString(),
                name: 'M JÉRÉMIE TABOADA ALVAREZ',
                address: '11 rue de Pommard\n75012 Paris',
                bic: 'AGRIFRPP882',
                iban: 'FR76 1820 6000 5165 0085 3209 021',
                siren: '853 291 268',
            },
        },
    } as Invoice;

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const font = await pdf.embedFont(await read(BricolageGrotesque).arrayBuffer());
    const fontBold = await pdf.embedFont(await read(BricolageGrotesqueBold).arrayBuffer());

    const page = pdf.addPage();

    // company
    const company = invoice.expand!.company_id;
    page.moveTo(pageMargin, page.getHeight() - pageMargin);
    page.drawText(company.name, {font: fontBold, size: 12});
    page.moveDown(lineHeight);
    for (const line of company.address.split('\n')) {
        page.drawText(line, {font, size: 12});
        page.moveDown(lineHeight);
    }
    if (company.phone) {
        page.drawText(company.phone, {font, size: 12});
        page.moveDown(lineHeight);
    }
    if (company.email) {
        page.drawText(company.email, {font, size: 12});
        page.moveDown(lineHeight);
    }
    page.moveDown(lineHeight);
    page.drawText(`SIREN : ${company.siren}`, {font, size: 12});
    page.moveDown(lineHeight);
    page.drawText(`Date d'émission : ${formatDate(new Date(invoice.emission_date))}`, {font, size: 12});

    // client
    const client = invoice.expand!.client_id;

    page.moveTo(page.getWidth() - fontBold.widthOfTextAtSize(client.name, 12) - pageMargin, page.getHeight() - 150);
    page.drawText(client.name, {font: fontBold, size: 12});
    let y = page.getHeight() - 170;
    for (const line of client.address.split('\n')) {
        page.moveTo(page.getWidth() - fontBold.widthOfTextAtSize(line, 12) - pageMargin, y);
        y -= lineHeight;
        page.drawText(line, {font, size: 12});
    }

    // infos
    const title = `Facture nº${invoice.number} : ${invoice.name}`;
    page.moveTo(50, page.getHeight() - 250);
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

    y = page.getHeight() - 290;
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
    for (const {price, description} of invoice.lines) {
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

    const totalText = `Total (HT) : ${invoice.lines.reduce((total, line) => total + line.price, 0)} €`;
    page.moveTo(page.getWidth() - fontBold.widthOfTextAtSize(totalText, 12) - pageMargin, y);
    page.drawText(totalText, {font: fontBold, size: 12});

    page.moveTo(pageMargin, y - 25);
    page.drawText(`BIC : ${company.bic}`, {font, size: 12});
    page.moveDown(lineHeight);
    page.drawText(`IBAN : ${company.iban}`, {font, size: 12});

    const bytes = await pdf.save();

    return new Response(await pdf.save(), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': bytes.byteLength.toString(),
        },
    });
}
