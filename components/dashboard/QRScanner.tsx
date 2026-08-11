'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { calculateDiscount, formatARS, getPaymentMethodLabel } from '@/lib/discount-logic';
import { decodeQRPayload } from '@/lib/qr-utils';
import { createClient } from '@/lib/supabase';
import { processQRScanServer, ProcessScanResult } from '@/app/actions/scanner';
import type { PaymentMethod, DiscountOutcome, ScannerState, Profile } from '@/types';
import {
  QrCode,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  User,
  Banknote,
  ArrowLeftRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';

// ============================================================
// TIPOS LOCALES
// ============================================================

type ScanResult = ProcessScanResult;

// ============================================================
// COMPONENTE PRINCIPAL: QRScanner
// ============================================================

export function QRScanner() {
  const supabase = createClient();

  // ── Estado del escáner ────────────────────────────────────
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [originalAmount, setOriginalAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = 'qr-scanner-container';

  // ── Limpiar escáner al desmontar ──────────────────────────
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  // ── Iniciar escáner de cámara ─────────────────────────────
  const startScanner = useCallback(() => {
    const amount = parseFloat(originalAmount);
    if (!originalAmount || isNaN(amount) || amount <= 0) {
      setErrorMessage('Por favor, ingresá el monto de la compra antes de escanear.');
      return;
    }

    setErrorMessage('');
    setScannerState('scanning');

    // Inicializar html5-qrcode después de que el div esté en el DOM
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        scannerDivId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        /* verbose= */ false,
      );

      scanner.render(
        async (decodedText) => {
          // QR escaneado exitosamente
          await scanner.clear();
          scannerRef.current = null;
          await handleQRScanned(decodedText, amount, paymentMethod);
        },
        (errorMessage) => {
          // Errores de escaneo en curso (ignorar los de "no QR found")
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('QR Scanner error:', errorMessage);
          }
        },
      );

      scannerRef.current = scanner;
    }, 100);
  }, [originalAmount, paymentMethod]);

  // ── Procesar QR escaneado ─────────────────────────────────
  const handleQRScanned = async (
    qrText: string,
    amount: number,
    method: PaymentMethod,
  ) => {
    setScannerState('processing');

    try {
      const result = await processQRScanServer(qrText, amount, method);
      setScanResult(result);
      setScannerState('result');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar el código QR.');
      setScannerState('error');
    }
  };

  // ── Resetear para nuevo escaneo ───────────────────────────
  const handleReset = useCallback(() => {
    setScannerState('idle');
    setScanResult(null);
    setErrorMessage('');
    setOriginalAmount('');
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  }, []);

  const handleCancelScan = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScannerState('idle');
    setErrorMessage('');
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
          <QrCode className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Escáner de Descuentos</h2>
          <p className="text-sm text-slate-400">Escanéa el QR del cliente o comerciante</p>
        </div>
      </div>

      {/* ── ESTADO: IDLE — Formulario previo al escaneo ───── */}
      {scannerState === 'idle' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">

          {/* Monto de la compra */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              <DollarSign className="inline h-4 w-4 mr-1 text-violet-400" />
              Monto total de la compra (ARS)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                type="number"
                id="scanner-amount"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-lg font-semibold"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <PaymentMethodButton
                method="cash"
                selected={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
                label="Efectivo"
                Icon={Banknote}
              />
              <PaymentMethodButton
                method="transfer"
                selected={paymentMethod === 'transfer'}
                onClick={() => setPaymentMethod('transfer')}
                label="Transferencia"
                Icon={ArrowLeftRight}
              />
            </div>
            <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Las tarjetas de crédito/débito no aplican descuento
            </p>
          </div>

          {/* Error de validación */}
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg bg-red-950/50 border border-red-700 p-3">
              <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          {/* Botón escanear */}
          <button
            id="btn-start-scan"
            onClick={startScanner}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-900/50 hover:shadow-violet-800/50 hover:scale-[1.01] active:scale-[0.99]"
          >
            <QrCode className="h-5 w-5" />
            Activar Cámara y Escanear
          </button>

          {/* Info de días válidos */}
          <DayStatusBadge />
        </div>
      )}

      {/* ── ESTADO: SCANNING — Cámara activa ─────────────── */}
      {scannerState === 'scanning' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-slate-300 font-medium">Apuntá la cámara al código QR</p>
            <p className="text-slate-500 text-sm">El escaneo es automático</p>
          </div>

          {/* Contenedor del escáner de html5-qrcode */}
          <div
            id={scannerDivId}
            className="overflow-hidden rounded-xl [&_video]:rounded-xl [&_#html5-qrcode-anchor-scan-type-change]:hidden [&_#html5-qrcode-button-file-selection]:hidden"
          />

          <button
            onClick={handleCancelScan}
            className="w-full py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm flex items-center justify-center gap-2"
          >
            <CameraOff className="h-4 w-4" />
            Cancelar
          </button>
        </div>
      )}

      {/* ── ESTADO: PROCESSING ───────────────────────────── */}
      {scannerState === 'processing' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-violet-400 animate-spin" />
          <p className="text-slate-300 font-medium">Validando QR...</p>
          <p className="text-slate-500 text-sm text-center">
            Verificando el usuario y calculando el descuento
          </p>
        </div>
      )}

      {/* ── ESTADO: RESULT ───────────────────────────────── */}
      {scannerState === 'result' && scanResult && (
        <DiscountResultCard
          result={scanResult}
          onReset={handleReset}
        />
      )}

      {/* ── ESTADO: ERROR ────────────────────────────────── */}
      {scannerState === 'error' && (
        <div className="rounded-2xl border border-red-700 bg-red-950/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="h-5 w-5" />
            <span className="font-semibold">Error inesperado</span>
          </div>
          <p className="text-slate-300 text-sm">{errorMessage}</p>
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Volver a intentar
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

// ------ Botón de método de pago ─────────────────────────────

interface PaymentMethodButtonProps {
  method: PaymentMethod;
  selected: boolean;
  onClick: () => void;
  label: string;
  Icon: React.ElementType;
}

function PaymentMethodButton({ selected, onClick, label, Icon }: PaymentMethodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200
        ${selected
          ? 'border-violet-500 bg-violet-950/60 text-violet-300 shadow-lg shadow-violet-900/30'
          : 'border-slate-600 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-300'
        }
      `}
    >
      <Icon className={`h-4 w-4 ${selected ? 'text-violet-400' : ''}`} />
      {label}
    </button>
  );
}

// ------ Badge de días válidos ────────────────────────────────

function DayStatusBadge() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
  const isValidDay = dayOfWeek >= 1 && dayOfWeek <= 4;

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[dayOfWeek];

  return (
    <div className={`
      flex items-center gap-2 p-3 rounded-xl text-sm
      ${isValidDay
        ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400'
        : 'bg-amber-950/50 border border-amber-800 text-amber-400'
      }
    `}>
      <span className="text-base">{isValidDay ? '✅' : '⚠️'}</span>
      <div>
        <span className="font-medium">Hoy es {todayName}.</span>
        {isValidDay
          ? ' Los descuentos están activos.'
          : ' Los descuentos no aplican hoy (solo Lun–Jue).'}
      </div>
    </div>
  );
}

// ------ Tarjeta de resultado del descuento ──────────────────

interface DiscountResultCardProps {
  result: ScanResult;
  onReset: () => void;
}

function DiscountResultCard({ result, onReset }: DiscountResultCardProps) {
  const { outcome, scannedUser, originalAmount, paymentMethod } = result;
  const isSuccess = outcome.valid;

  const getRoleBadge = (role: string) => {
    if (role === 'merchant') return { label: 'Comerciante', color: 'bg-blue-950/60 text-blue-300 border-blue-700' };
    if (role === 'client') return { label: 'Cliente', color: 'bg-slate-800 text-slate-300 border-slate-600' };
    return { label: 'SuperAdmin', color: 'bg-violet-950/60 text-violet-300 border-violet-700' };
  };

  return (
    <div className={`
      rounded-2xl border backdrop-blur-sm p-6 space-y-5 transition-all
      ${isSuccess
        ? 'border-emerald-700 bg-emerald-950/30'
        : 'border-red-700 bg-red-950/20'
      }
    `}>

      {/* Ícono de resultado */}
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900 border border-emerald-700">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900 border border-red-700">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
        )}
        <div>
          <h3 className={`font-bold text-lg ${isSuccess ? 'text-emerald-300' : 'text-red-300'}`}>
            {isSuccess ? '¡Descuento Aplicado!' : 'Descuento No Aplicable'}
          </h3>
          <p className="text-slate-400 text-sm">{outcome.reason}</p>
        </div>
      </div>

      {/* Info del usuario escaneado */}
      {scannedUser && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300 font-medium text-sm">Usuario escaneado</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">
                {scannedUser.business_name ?? scannedUser.full_name ?? 'Sin nombre'}
              </p>
              {scannedUser.business_name && scannedUser.full_name && (
                <p className="text-slate-400 text-sm">{scannedUser.full_name}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getRoleBadge(scannedUser.role).color}`}>
              {getRoleBadge(scannedUser.role).label}
            </span>
          </div>
        </div>
      )}

      {/* Cálculo del descuento */}
      {isSuccess && outcome.valid && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/60 p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Método de pago</span>
            <span className="text-white font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Monto original</span>
            <span className="text-white">{formatARS(originalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Descuento</span>
            <span className="text-emerald-400 font-bold text-base">−{outcome.discount_pct}%</span>
          </div>
          <div className="border-t border-emerald-800/60 pt-3 flex justify-between items-center">
            <span className="text-white font-semibold">Total a cobrar</span>
            <span className="text-emerald-300 font-bold text-2xl">{formatARS(outcome.final_amount)}</span>
          </div>
        </div>
      )}

      {/* Botón volver */}
      <button
        id="btn-scan-again"
        onClick={onReset}
        className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Nuevo Escaneo
      </button>
    </div>
  );
}
