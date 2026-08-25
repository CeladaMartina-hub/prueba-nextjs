import { NextRequest, NextResponse } from 'next/server';
import { fetchAllProductsForExport } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    const products = await fetchAllProductsForExport(query);

    // BOM (\uFEFF) para que Excel reconozca correctamente los acentos y caracteres UTF-8
    const BOM = '\uFEFF';
    
    // Encabezados de la tabla
    const headers = ['Nombre', 'Categoría', 'Precio', 'Stock'];

    // Convertir cada producto en una fila de CSV separada por punto y coma (;)
    const rows = products.map((product) => [
      `"${(product.name || '').replace(/"/g, '""')}"`,
      `"${(product.category_name || '').replace(/"/g, '""')}"`,
      product.price ?? 0,
      product.stock ?? 0,
    ]);

    const csvContent =
      BOM +
      [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="productos.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar la exportación.' },
      { status: 500 }
    );
  }
}