import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ data, size = 200 }) => {
    const [qrUrl, setQrUrl] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!data) {
            setError('No data provided');
            return;
        }

        QRCode.toDataURL(data, {
            width: size,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
            .then(url => {
                setQrUrl(url);
                setError(null);
            })
            .catch(err => {
                console.error('QR Code generation error:', err);
                setError('Failed to generate QR code');
            });
    }, [data, size]);

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>;
    }

    if (!qrUrl) {
        return <div className="text-slate-400 text-sm">กำลังสร้าง QR Code...</div>;
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <img src={qrUrl} alt="QR Code" className="border-2 border-slate-200 rounded-lg" />
        </div>
    );
};

export default QRCodeDisplay;
