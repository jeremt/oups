import {read} from '$app/server';
import fontkit from '@pdf-lib/fontkit';
import {formatDate} from '$lib/helpers/formatDate';
import {grayscale, PDFDocument, PDFFont} from 'pdf-lib';
import type {DocumentLine} from '$lib/kysely/types';
import type {Clients, ClientsId} from '$lib/kysely/gen/public/Clients';
import type {Documents, DocumentsId} from '$lib/kysely/gen/public/Documents';
import type {Companies, CompaniesId} from '$lib/kysely/gen/public/Companies';

import BricolageGrotesque from './fonts/BricolageGrotesque-Regular.ttf';
import BricolageGrotesqueBold from './fonts/BricolageGrotesque-Bold.ttf';

const pageMargin = 50;
const lineHeight = 20;

export async function GET() {
    const invoice: Documents & {company: Companies; client: Clients} = {
        id: 1 as DocumentsId,
        client_id: 1 as ClientsId,
        organization_id: null,
        company_id: 1 as CompaniesId,
        created_at: new Date(),
        updated_at: new Date(),
        emitted_at: new Date(),
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
        note: '',
        type: 'invoice',
        quantity_base: 600,
        quantity_label: 'jour',
        client: {
            id: 1 as ClientsId,
            company_id: 1 as CompaniesId,
            created_at: new Date(),
            name: 'Ada Tech School',
            address: '28 rue du Petit Musc\n75004 Paris',
            updated_at: new Date(),
            logo_url: null,
            email: null,
        },
        company: {
            id: 1 as CompaniesId,
            quote_sequence: 14,
            invoice_sequence: 1,
            created_at: new Date(),
            updated_at: new Date(),
            name: 'M JÉRÉMIE TABOADA ALVAREZ',
            address: '11 rue de Pommard\n75012 Paris',
            bic: 'AGRIFRPP882',
            iban: 'FR76 1820 6000 5165 0085 3209 021',
            siren: '853 291 268',
            email: 'taboada.jeremie@gmail.com',
            phone: '06 24 91 22 44',
            logo_url: null,
        },
    };

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const font = await pdf.embedFont(await read(BricolageGrotesque).arrayBuffer());
    const fontBold = await pdf.embedFont(await read(BricolageGrotesqueBold).arrayBuffer());

    const page = pdf.addPage();

    // company
    const company = invoice.company;
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
    page.drawText(`Date d'émission : ${formatDate(invoice.emitted_at)}`, {font, size: 12});

    // client
    const client = invoice.client;

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
    for (const {price, description} of invoice.lines as DocumentLine[]) {
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

    const totalText = `Total (HT) : ${(invoice.lines as DocumentLine[]).reduce((total, line) => total + line.price, 0)} €`;
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
            'Content-Disposition': `attachment; filename="facture-n${invoice.number}-${invoice.name.replace(' ', '-').toLowerCase()}.pdf"`,
        },
    });
}
