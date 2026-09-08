import { forwardRef } from 'react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptTemplateProps {
  businessName: string;
  billId: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  upiId?: string;
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ businessName, billId, date, time, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, upiId }, ref) => {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

    return (
      <div
        ref={ref}
        className="receipt-template"
        style={{
          width: '80mm',
          maxWidth: '80mm',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '12px',
          lineHeight: '1.5',
          padding: '8mm 4mm',
          background: '#ffffff',
          color: '#000000',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{businessName.toUpperCase()}</p>
          <p style={{ fontSize: '10px', margin: '1mm 0' }}>PAYMENT RECEIPT</p>
          <p style={{ borderBottom: '1px dashed #000', margin: '2mm 0' }} />
        </div>

        {/* Bill details */}
        <div style={{ marginBottom: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bill ID:</span><span style={{ fontWeight: 'bold' }}>{billId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span><span>{date}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Time:</span><span>{time}</span>
          </div>
        </div>

        <p style={{ borderBottom: '1px dashed #000', margin: '2mm 0' }} />

        {/* Items */}
        <div style={{ marginBottom: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10px' }}>
            <span>ITEM</span><span>QTY</span><span>PRICE</span><span>TOTAL</span>
          </div>
          <p style={{ borderBottom: '1px solid #000', margin: '1mm 0' }} />
          {items.map((item, i) => (
            <div key={i} style={{ marginBottom: '1mm' }}>
              <span style={{ fontWeight: 'bold' }}>{item.name}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ width: '40%', overflow: 'hidden' }}></span>
                <span>{item.quantity}</span>
                <span>{formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            </div>
          ))}
        </div>

        <p style={{ borderBottom: '1px dashed #000', margin: '2mm 0' }} />

        {/* Totals */}
        <div style={{ marginBottom: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>SUBTOTAL:</span><span>{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>TAX:</span><span>{formatCurrency(tax)}</span>
            </div>
          )}
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>DISCOUNT:</span><span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <p style={{ borderBottom: '1px solid #000', margin: '1mm 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
            <span>TOTAL:</span><span>{formatCurrency(total)}</span>
          </div>
        </div>

        <p style={{ borderBottom: '1px dashed #000', margin: '2mm 0' }} />

        {/* Payment info */}
        <div style={{ marginBottom: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PAYMENT METHOD:</span><span>{paymentMethod}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>STATUS:</span>
            <span style={{ fontWeight: 'bold' }}>{paymentStatus}</span>
          </div>
          {upiId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>UPI:</span><span>{upiId}</span>
            </div>
          )}
        </div>

        <p style={{ borderBottom: '1px dashed #000', margin: '2mm 0' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '3mm', fontSize: '11px' }}>
          <p style={{ margin: '1mm 0', fontWeight: 'bold' }}>THANK YOU!</p>
          <p style={{ margin: '0.5mm 0' }}>VISIT AGAIN!</p>
          <p style={{ margin: '2mm 0', fontSize: '9px' }}>Powered by ENS Business OS</p>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';
export default ReceiptTemplate;
export type { ReceiptTemplateProps, ReceiptItem };
