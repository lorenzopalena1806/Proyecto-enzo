import { QRScanner } from '@/components/dashboard/QRScanner';

export const metadata = {
  title: 'Escáner de Descuentos | RedBeneficios',
  description: 'Escaneá el QR de tus clientes y comerciantes para aplicar descuentos automáticamente.',
};

export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Escáner de Descuentos</h1>
        <p className="text-slate-400 mt-1">
          Ingresá el monto, seleccioná el método de pago y escaneá el QR del cliente
        </p>
      </div>

      <QRScanner />
    </div>
  );
}
