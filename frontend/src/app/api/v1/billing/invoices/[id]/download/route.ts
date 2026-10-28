import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getServerDb();
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';
    const org = await db.getOrganizationById(orgId) || { name: 'Acme Corp' };
    const invoices = await db.listInvoices(orgId);
    const invoice = invoices.find((inv) => inv.id === id) || {
      id,
      amount: '$49.00',
      date: new Date().toLocaleDateString(),
    };

    const textContent = db.generateInvoiceContent(id, org.name, invoice.amount, invoice.date);

    return new NextResponse(textContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="Invoice-${id}.txt"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating invoice' }, { status: 500 });
  }
}
