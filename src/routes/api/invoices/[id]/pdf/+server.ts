import {formatDate} from '$lib/helpers/formatDate';
import type {Invoice} from '$lib/pocketbase/pocketbase';
import PDFDocument from 'pdfkit';

// Helper function to convert PDFKit document to Buffer
async function getBuffer(doc: typeof PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.end();
    });
}

export const GET = async () => {
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

    // Create a new PDF document
    const doc = new PDFDocument({margin: 50});

    let x = 50;
    let y = 50;
    const width = 510;

    // Company
    const company = invoice.expand!.company_id;
    doc.fontSize(12).text(company.name, x, y);
    y += 20;

    for (const line of company.address.split('\n')) {
        doc.text(line, x, y);
        y += 20;
    }
    if (company.phone) {
        doc.text(company.phone, x, y);
        y += 20;
    }
    if (company.email) {
        doc.text(company.email, x, y);
        y += 20;
    }
    y += 20;
    doc.text(`SIREN : ${company.siren}`, x, y);
    y += 20;

    doc.text(`Date d'émission : ${formatDate(new Date(invoice.emission_date))}`, x, y);
    y += 20;

    // client
    const client = invoice.expand!.client_id;
    x = 300;
    y = 150;
    doc.text(client.name, x, y, {align: 'right'});
    y += 20;
    for (const line of client.address.split('\n')) {
        doc.text(line, x, y, {align: 'right'});
        y += 20;
    }

    x = 50;
    y = 250;
    const title = `Facture nº${invoice.number} : ${invoice.name}`;
    doc.fontSize(20).text(title, x, y, {width});

    // Infos
    y += 30;
    const priceWidth = 100;
    const rowHeight = 25;
    const rowPadding = 8;

    doc.fontSize(12);
    doc.rect(x, y, width - priceWidth, rowHeight)
        .strokeColor('#cccccc')
        .stroke();
    doc.text(`Description`, x + rowPadding, y + rowPadding, {width: width - priceWidth});
    doc.rect(x + width - priceWidth, y, priceWidth, rowHeight).stroke();
    doc.text(`Prix (HT)`, x + rowPadding + width - priceWidth, y + rowPadding, {width: priceWidth});

    for (const {price, description} of invoice.lines) {
        y += rowHeight;
        doc.rect(x, y, width - priceWidth, rowHeight).stroke();
        doc.text(description, x + rowPadding, y + rowPadding, {width: width - priceWidth});
        doc.rect(x + width - priceWidth, y, priceWidth, rowHeight).stroke();
        doc.text(`${price} €`, x + rowPadding + width - priceWidth, y + rowPadding, {width: priceWidth});
    }

    y += rowHeight;
    doc.rect(x, y, width - priceWidth, rowHeight).stroke();
    doc.text('Total', x + rowPadding, y + rowPadding, {width: width - priceWidth});
    doc.rect(x + width - priceWidth, y, priceWidth, rowHeight).stroke();
    doc.text(`${invoice.lines.reduce((result, line) => result + line.price, 0)} €`, x + rowPadding + width - priceWidth, y + rowPadding, {width: priceWidth});

    y += 50;
    doc.fontSize(16).text('Informations de paiement', x, y);
    y += 30;
    doc.fontSize(12).text(`BIC : ${company.bic}`, x, y);
    y += 20;
    doc.text(`IBAN : ${company.iban}`, x, y);

    try {
        const buffer = await getBuffer(doc);

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${title}.pdf"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return new Response('Error generating PDF', {status: 500});
    }
};
