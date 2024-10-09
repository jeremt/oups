import {read} from '$app/server';
import fontkit from '@pdf-lib/fontkit';
import {PDFDocument} from 'pdf-lib';

import BricolageGrotesque from './fonts/BricolageGrotesque-Regular.ttf';
import BricolageGrotesqueBold from './fonts/BricolageGrotesque-Bold.ttf';

export async function GET() {
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const font = await pdf.embedFont(await read(BricolageGrotesque).arrayBuffer());
    const fontBold = await pdf.embedFont(await read(BricolageGrotesqueBold).arrayBuffer());

    const page = pdf.addPage();

    page.moveTo(25, page.getHeight() - 25);
    page.drawText('Bonjour !', {font: fontBold, size: 18});
    page.moveDown(25);
    page.drawText('Ceci est un sous-titre', {font, size: 12});

    const bytes = await pdf.save();

    return new Response(await pdf.save(), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': bytes.byteLength.toString(),
        },
    });
}
