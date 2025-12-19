import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../utils/api';
import { QrCode, Package, Ticket, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

const QRScanner = () => {
    const [scanType, setScanType] = useState('parcel'); // 'parcel' or 'ticket'
    const [result, setResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        if (scanning) {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                false
            );

            html5QrcodeScanner.render(onScanSuccess, onScanError);
            setScanner(html5QrcodeScanner);

            return () => {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear scanner:", error);
                });
            };
        }
    }, [scanning, scanType]);

    const onScanSuccess = async (decodedText) => {
        try {
            const parsedData = JSON.parse(decodedText);

            if (parsedData.type !== scanType) {
                setResult({
                    success: false,
                    message: `QR Code นี้เป็นของ${parsedData.type === 'parcel' ? 'พัสดุ' : 'ตั๋ว'} กรุณาเลือกประเภทที่ถูกต้อง`
                });
                return;
            }

            if (scanType === 'parcel') {
                const response = await api.post(`/api/parcels/${parsedData.id}/scan`);
                setResult({
                    success: true,
                    message: 'พัสดุถูกทำเครื่องหมายว่าจัดส่งแล้ว',
                    data: response.data
                });
            } else {
                const response = await api.post(`/api/tickets/${parsedData.id}/checkin`);
                setResult({
                    success: true,
                    message: 'Check-in สำเร็จ',
                    data: response.data
                });
            }

            // Stop scanning after successful scan
            if (scanner) {
                scanner.clear();
            }
            setScanning(false);
        } catch (error) {
            console.error('Scan error:', error);
            setResult({
                success: false,
                message: error.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            });

            // Stop scanning on error
            if (scanner) {
                scanner.clear();
            }
            setScanning(false);
        }
    };

    const onScanError = (error) => {
        // Ignore scan errors (happens frequently during scanning)
        console.debug('Scan error:', error);
    };

    const startScanning = () => {
        setResult(null);
        setScanning(true);
    };

    const stopScanning = () => {
        if (scanner) {
            scanner.clear();
        }
        setScanning(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <QrCode className="text-blue-500" size={24} />
                    แสกน QR Code
                </h2>
            </div>

            {/* Scan Type Selector */}
            <div className="card p-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">เลือกประเภท</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setScanType('parcel');
                            setResult(null);
                            if (scanning) stopScanning();
                        }}
                        className={clsx(
                            "flex-1 p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium",
                            scanType === 'parcel'
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-slate-200 hover:border-orange-300"
                        )}
                    >
                        <Package size={20} />
                        พัสดุ
                    </button>
                    <button
                        onClick={() => {
                            setScanType('ticket');
                            setResult(null);
                            if (scanning) stopScanning();
                        }}
                        className={clsx(
                            "flex-1 p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium",
                            scanType === 'ticket'
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 hover:border-blue-300"
                        )}
                    >
                        <Ticket size={20} />
                        ตั๋วเรือ
                    </button>
                </div>
            </div>

            {/* Scanner Area */}
            <div className="card p-6">
                {!scanning ? (
                    <div className="text-center py-12">
                        <QrCode className="mx-auto text-slate-300 mb-4" size={64} />
                        <p className="text-slate-500 mb-6">
                            กดปุ่มด้านล่างเพื่อเริ่มแสกน QR Code {scanType === 'parcel' ? 'พัสดุ' : 'ตั๋วเรือ'}
                        </p>
                        <button
                            onClick={startScanning}
                            className="btn-primary px-6 py-3"
                        >
                            เริ่มแสกน
                        </button>
                    </div>
                ) : (
                    <div>
                        <div id="qr-reader" className="mb-4"></div>
                        <button
                            onClick={stopScanning}
                            className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                        >
                            หยุดแสกน
                        </button>
                    </div>
                )}
            </div>

            {/* Result Display */}
            {result && (
                <div className={clsx(
                    "card p-6 border-2",
                    result.success
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                )}>
                    <div className="flex items-start gap-3">
                        {result.success ? (
                            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                        ) : (
                            <XCircle className="text-red-600 flex-shrink-0" size={24} />
                        )}
                        <div className="flex-1">
                            <h3 className={clsx(
                                "font-bold mb-1",
                                result.success ? "text-green-800" : "text-red-800"
                            )}>
                                {result.success ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
                            </h3>
                            <p className={clsx(
                                "text-sm",
                                result.success ? "text-green-700" : "text-red-700"
                            )}>
                                {result.message}
                            </p>
                        </div>
                    </div>
                    {result.success && (
                        <button
                            onClick={startScanning}
                            className="mt-4 w-full py-2 bg-white border border-green-300 hover:bg-green-50 rounded-lg transition-colors text-green-700 font-medium"
                        >
                            แสกนต่อ
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QRScanner;
