import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export const printTicketReceipt = (ticket) => {
    const printWindow = window.open('', '_blank');
    const routeText = ticket.route === 'SURAT_TO_KOHTAO'
        ? 'สุราษฎร์ธานี → เกาะเต่า'
        : 'เกาะเต่า → สุราษฎร์ธานี';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>ใบเสร็จตั๋วเรือ #${ticket.id}</title>
            <style>
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; }
                }
                body {
                    font-family: 'Sarabun', 'Tahoma', sans-serif;
                    max-width: 80mm;
                    margin: 0 auto;
                    padding: 20px;
                    font-size: 14px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px dashed #333;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: bold;
                }
                .header p {
                    margin: 5px 0;
                    font-size: 12px;
                    color: #666;
                }
                .receipt-no {
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    padding: 5px 0;
                }
                .info-label {
                    font-weight: bold;
                    color: #333;
                }
                .info-value {
                    color: #000;
                }
                .seat-box {
                    background: #f0f0f0;
                    padding: 15px;
                    text-align: center;
                    margin: 15px 0;
                    border: 2px solid #333;
                    border-radius: 8px;
                }
                .seat-box .label {
                    font-size: 12px;
                    color: #666;
                }
                .seat-box .value {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .total {
                    border-top: 2px solid #333;
                    border-bottom: 2px solid #333;
                    padding: 12px 0;
                    margin: 15px 0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 18px;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px dashed #333;
                    font-size: 12px;
                    color: #666;
                }
                .barcode {
                    text-align: center;
                    margin: 15px 0;
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚓ เกาะเต่า ไนท์โบ๊ท</h1>
                <p>Ko Tao Night Boat Service</p>
                <p>โทร: 077-123-456</p>
            </div>

            <div class="receipt-no">ใบเสร็จตั๋วเรือ #${String(ticket.id).padStart(6, '0')}</div>

            <div class="info-row">
                <span class="info-label">วันที่ออกใบเสร็จ:</span>
                <span class="info-value">${format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}</span>
            </div>

            <div class="info-row">
                <span class="info-label">วันที่เดินทาง:</span>
                <span class="info-value">${format(new Date(ticket.travelDate), 'dd/MM/yyyy', { locale: th })}</span>
            </div>

            <div class="info-row">
                <span class="info-label">เส้นทาง:</span>
                <span class="info-value">${routeText}</span>
            </div>

            <div class="info-row">
                <span class="info-label">ผู้โดยสาร:</span>
                <span class="info-value">${ticket.passengerName}</span>
            </div>

            <div class="info-row">
                <span class="info-label">โทรศัพท์:</span>
                <span class="info-value">${ticket.phone}</span>
            </div>

            <div class="seat-box">
                <div class="label">หมายเลขที่นั่ง</div>
                <div class="value">${ticket.seatNumber}</div>
                <div class="label">${ticket.seatLayout === 'LAYOUT_50' ? 'เรือ 50 ที่นั่ง' : 'เรือ 30 ที่นั่ง'}</div>
            </div>

            <div class="total">
                <span>ราคารวม:</span>
                <span>${ticket.price.toFixed(2)} บาท</span>
            </div>

            <div class="info-row">
                <span class="info-label">พนักงานขาย:</span>
                <span class="info-value">${ticket.seller?.name || '-'}</span>
            </div>

            <div class="barcode">
                |||| || ||| |||| | || ||| |||| ||<br>
                TICKET-${String(ticket.id).padStart(8, '0')}
            </div>

            <div class="footer">
                <p>⚠️ กรุณาเก็บใบเสร็จนี้ไว้เป็นหลักฐาน</p>
                <p>Please keep this receipt for your record</p>
                <p>ขอบคุณที่ใช้บริการ 🙏</p>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};

export const printParcelReceipt = (parcel) => {
    const printWindow = window.open('', '_blank');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>ใบเสร็จพัสดุ #${parcel.id}</title>
            <style>
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; }
                }
                body {
                    font-family: 'Sarabun', 'Tahoma', sans-serif;
                    max-width: 80mm;
                    margin: 0 auto;
                    padding: 20px;
                    font-size: 14px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px dashed #333;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: bold;
                }
                .header p {
                    margin: 5px 0;
                    font-size: 12px;
                    color: #666;
                }
                .receipt-no {
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .section {
                    margin: 15px 0;
                    padding: 10px;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 13px;
                    color: #555;
                    margin-bottom: 8px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 6px 0;
                }
                .info-label {
                    font-weight: bold;
                    color: #333;
                }
                .info-value {
                    color: #000;
                }
                .weight-box {
                    background: #fff;
                    padding: 15px;
                    text-align: center;
                    margin: 15px 0;
                    border: 2px solid #333;
                    border-radius: 8px;
                }
                .weight-box .label {
                    font-size: 12px;
                    color: #666;
                }
                .weight-box .value {
                    font-size: 28px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .total {
                    border-top: 2px solid #333;
                    border-bottom: 2px solid #333;
                    padding: 12px 0;
                    margin: 15px 0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 18px;
                    font-weight: bold;
                }
                .status-badge {
                    display: inline-block;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .status-paid {
                    background: #d4edda;
                    color: #155724;
                }
                .status-unpaid {
                    background: #f8d7da;
                    color: #721c24;
                }
                .status-waiting {
                    background: #fff3cd;
                    color: #856404;
                }
                .status-delivered {
                    background: #d1ecf1;
                    color: #0c5460;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px dashed #333;
                    font-size: 12px;
                    color: #666;
                }
                .barcode {
                    text-align: center;
                    margin: 15px 0;
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📦 เกาะเต่า ไนท์โบ๊ท</h1>
                <p>บริการรับฝากพัสดุ</p>
                <p>โทร: 077-123-456</p>
            </div>

            <div class="receipt-no">ใบเสร็จพัสดุ #${String(parcel.id).padStart(6, '0')}</div>

            <div class="info-row">
                <span class="info-label">วันที่รับฝาก:</span>
                <span class="info-value">${format(new Date(parcel.depositDate), 'dd/MM/yyyy', { locale: th })}</span>
            </div>

            <div class="section">
                <div class="section-title">📤 ผู้ฝาก</div>
                <div class="info-row">
                    <span class="info-label">ชื่อ:</span>
                    <span class="info-value">${parcel.senderName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">โทร:</span>
                    <span class="info-value">${parcel.senderPhone}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">📥 ผู้รับ</div>
                <div class="info-row">
                    <span class="info-label">ชื่อ:</span>
                    <span class="info-value">${parcel.receiverName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">โทร:</span>
                    <span class="info-value">${parcel.receiverPhone}</span>
                </div>
            </div>

            <div class="weight-box">
                <div class="label">น้ำหนักพัสดุ</div>
                <div class="value">${parcel.weight} กก.</div>
                <div class="label">อัตรา 10 บาท/กก. (ขั้นต่ำ 30 บาท)</div>
            </div>

            <div class="total">
                <span>ค่าบริการ:</span>
                <span>${parcel.price.toFixed(2)} บาท</span>
            </div>

            <div style="text-align: center; margin: 15px 0;">
                <div>
                    <span class="status-badge ${parcel.paymentStatus === 'PAID' ? 'status-paid' : 'status-unpaid'}">
                        ${parcel.paymentStatus === 'PAID' ? '✓ ชำระแล้ว' : '⚠ ยังไม่ชำระ'}
                    </span>
                </div>
                <div>
                    <span class="status-badge ${parcel.status === 'DELIVERED' ? 'status-delivered' : 'status-waiting'}">
                        ${parcel.status === 'DELIVERED' ? '✓ จัดส่งแล้ว' : '⏳ รอจัดส่ง'}
                    </span>
                </div>
            </div>

            <div class="info-row">
                <span class="info-label">พนักงานรับฝาก:</span>
                <span class="info-value">${parcel.seller?.name || '-'}</span>
            </div>

            <div class="barcode">
                |||| || ||| |||| | || ||| |||| ||<br>
                PARCEL-${String(parcel.id).padStart(8, '0')}
            </div>

            <div class="footer">
                <p>⚠️ กรุณานำใบเสร็จนี้มารับพัสดุ</p>
                <p>Please present this receipt to collect parcel</p>
                <p>ขอบคุณที่ใช้บริการ 🙏</p>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};
