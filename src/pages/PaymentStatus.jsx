import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getPaymentStatus } from "../api";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const merchantReference = searchParams.get("OrderMerchantReference");

  const [status, setStatus] = useState(() => orderTrackingId ? "loading" : "error");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!orderTrackingId) return;

    getPaymentStatus(orderTrackingId)
      .then((res) => {
        if (res?.success && res?.data) {
          setPaymentData(res.data);
          setStatus(res.data.status || "PENDING");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [orderTrackingId]);

  if (status === "loading") {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-charcoal/50">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-3">Payment Successful!</h1>
          <p className="text-sm text-charcoal/50 mb-6">Your order has been confirmed and we're preparing it for delivery.</p>
          {paymentData && (
            <div className="bg-white/60 border border-beige/30 p-5 text-left text-sm text-charcoal/70 space-y-2 mb-8">
              {paymentData.amount && (
                <div className="flex justify-between">
                  <span>Amount Paid</span>
                  <span className="font-medium text-charcoal">{paymentData.currency} {Number(paymentData.amount).toLocaleString()}</span>
                </div>
              )}
              {paymentData.paymentMethod && (
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium text-charcoal">{paymentData.paymentMethod}</span>
                </div>
              )}
              {merchantReference && (
                <div className="flex justify-between">
                  <span>Order Ref</span>
                  <span className="font-medium text-charcoal">#{merchantReference}</span>
                </div>
              )}
            </div>
          )}
          <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-3">Payment Pending</h1>
          <p className="text-sm text-charcoal/50 mb-6">Your payment is still being processed. This usually resolves within a few minutes.</p>
          <button
            onClick={() => {
              setStatus("loading");
              getPaymentStatus(orderTrackingId)
                .then((res) => {
                  setPaymentData(res?.data || null);
                  setStatus(res?.data?.status || "error");
                })
                .catch(() => setStatus("error"));
            }}
            className="btn-gold inline-block mr-4"
          >
            Check Again
          </button>
          <Link to="/shop" className="btn-primary inline-block">Back to Shop</Link>
        </div>
      </div>
    );
  }

  if (status === "FAILED" || status === "CANCELLED") {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-3">
            {status === "CANCELLED" ? "Payment Cancelled" : "Payment Failed"}
          </h1>
          <p className="text-sm text-charcoal/50 mb-8">
            {status === "CANCELLED"
              ? "You cancelled the payment. Your cart has not been charged."
              : "The payment could not be completed. Please try again."}
          </p>
          <Link to="/checkout" className="btn-gold inline-block mr-4">Try Again</Link>
          <Link to="/shop" className="btn-primary inline-block">Back to Shop</Link>
        </div>
      </div>
    );
  }

  // error fallback
  return (
    <div className="pt-32 pb-20 min-h-screen text-center">
      <div className="max-w-md mx-auto px-6 animate-fade-in">
        <h1 className="font-serif text-3xl text-charcoal mb-3">Something Went Wrong</h1>
        <p className="text-sm text-charcoal/50 mb-8">
          We couldn't verify your payment status. If you were charged, please contact us with your order reference.
        </p>
        {merchantReference && (
          <p className="text-xs text-charcoal/40 mb-6">Reference: #{merchantReference}</p>
        )}
        <Link to="/shop" className="btn-primary inline-block">Back to Shop</Link>
      </div>
    </div>
  );
}
