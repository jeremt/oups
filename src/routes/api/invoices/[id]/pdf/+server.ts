import PDFDocument from 'pdfkit';

interface Company {
    name: string;
    address: string;
    city: string;
    phone: string;
}

interface Client {
    name: string;
    address: string;
    city: string;
    email: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    company: Company;
    client: Client;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
}

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
    // Sample invoice data - in real app, this might come from a database or query params
    const invoiceData: InvoiceData = {
        invoiceNumber: 'INV-2024-001',
        date: '2024-03-20',
        dueDate: '2024-04-20',
        company: {
            name: 'Tech Solutions Inc.',
            address: '123 Business Street',
            city: 'San Francisco, CA 94105',
            phone: '(555) 123-4567',
        },
        client: {
            name: 'John Smith',
            address: '456 Client Avenue',
            city: 'New York, NY 10001',
            email: 'john.smith@example.com',
        },
        items: [
            {
                description: 'Web Development Services',
                quantity: 40,
                rate: 75,
                amount: 3000,
            },
            {
                description: 'UI/UX Design',
                quantity: 20,
                rate: 85,
                amount: 1700,
            },
        ],
        subtotal: 4700,
        tax: 470,
        total: 5170,
    };

    // Create a new PDF document
    const doc = new PDFDocument({margin: 50});

    // Add company logo (placeholder)
    doc.rect(50, 50, 100, 50).stroke().fontSize(10).text('LOGO', 75, 70);

    // Company details
    doc.fontSize(20)
        .text('INVOICE', 275, 50)
        .fontSize(10)
        .text(invoiceData.company.name, 400, 50)
        .text(invoiceData.company.address, 400, 65)
        .text(invoiceData.company.city, 400, 80)
        .text(invoiceData.company.phone, 400, 95);

    // Invoice details
    doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`, 50, 130).text(`Date: ${invoiceData.date}`, 50, 150).text(`Due Date: ${invoiceData.dueDate}`, 50, 170);

    // Client details
    doc.fontSize(12)
        .text('Bill To:', 50, 200)
        .text(invoiceData.client.name, 50, 220)
        .text(invoiceData.client.address, 50, 235)
        .text(invoiceData.client.city, 50, 250)
        .text(invoiceData.client.email, 50, 265);

    // Table header
    const tableTop = 330;
    doc.fontSize(10).text('Description', 50, tableTop).text('Quantity', 250, tableTop).text('Rate', 350, tableTop).text('Amount', 450, tableTop);

    // Table content
    let position = tableTop + 30;
    invoiceData.items.forEach(item => {
        doc.text(item.description, 50, position).text(item.quantity.toString(), 250, position).text(`$${item.rate}`, 350, position).text(`$${item.amount}`, 450, position);
        position += 30;
    });

    // Totals
    const totalsPosition = position + 30;
    doc.text('Subtotal:', 350, totalsPosition)
        .text(`$${invoiceData.subtotal}`, 450, totalsPosition)
        .text('Tax (10%):', 350, totalsPosition + 20)
        .text(`$${invoiceData.tax}`, 450, totalsPosition + 20)
        .fontSize(12)
        .text('Total:', 350, totalsPosition + 40)
        .text(`$${invoiceData.total}`, 450, totalsPosition + 40);

    // Footer
    doc.fontSize(10).text('Thank you for your business!', 50, 700).text('Payment is due within 30 days', 50, 715);

    try {
        const buffer = await getBuffer(doc);

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="invoice.pdf"',
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return new Response('Error generating PDF', {status: 500});
    }
};
