"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Clock, Printer, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

type OrderStatus = "queued" | "printing" | "ready" | "completed" | "cancelled";

function TrackPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [status, setStatus] = useState<OrderStatus>("queued");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [shopName, setShopName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Real-time polling
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
          setStatus(data.status as OrderStatus);
          
          try {
            const shopRes = await fetch(`http://127.0.0.1:8000/shops/`);
            if (shopRes.ok) {
              const shops = await shopRes.json();
              const shop = shops.find((s: any) => s.shop_id === data.shop_id);
              if (shop) setShopName(shop.name);
            }
          } catch (e) {
            console.error("Failed to fetch shop details", e);
          }
        }
      } catch (e) {
        console.error("Failed to fetch order", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const steps = [
    { id: "queued", title: "In Queue", icon: Clock, description: `Queue Position: ${orderDetails?.queue_number || "..."}` },
    { id: "printing", title: "Printing", icon: Printer, description: "Your file is being printed" },
    { id: "ready", title: "Ready for Pickup", icon: CheckCircle2, description: "Please collect your document" },
  ];

  const getStepIndex = (s: OrderStatus) => {
    if (s === 'completed') return 3;
    if (s === 'cancelled') return -1;
    return steps.findIndex(step => step.id === s);
  }
  const currentStep = getStepIndex(status);

  if (loading) {
    return <div className="text-center py-20 mt-16 text-gray-500">Loading Order Details...</div>;
  }

  if (!orderId || !orderDetails) {
    return (
      <div className="text-center py-20 mt-16 flex flex-col items-center">
        <AlertCircle size={48} className="text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-gray-400">Please provide a valid order ID via the URL or access this page from your history.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order #{orderDetails.order_id}</h1>
          <p className="text-gray-400 mb-2">{shopName || `Shop ID: ${orderDetails.shop_id}`} • {orderDetails.copies} Copies • {orderDetails.print_type === 'color' ? 'Color' : 'B&W'} • ${(orderDetails.total_cost || 0).toFixed(2)}</p>
          {orderDetails.addons && orderDetails.addons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {orderDetails.addons.map((addon: string) => (
                <span key={addon} className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs text-gray-300">
                  {addon}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-400 mb-1">Status</p>
          <p className="text-2xl font-mono font-bold text-white capitalize">{status}</p>
        </div>
      </div>

      <Card className="p-8 md:p-12 relative overflow-hidden">
        {/* Background glow syncing with current status */}
        <motion.div 
          animate={{ 
            backgroundColor: status === 'ready' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(92, 107, 192, 0.05)'
          }}
          className="absolute inset-0 transition-colors duration-1000"
        />

        <div className="relative z-10">
          <div className="space-y-12">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep || currentStep === 3;
              
              return (
                <div key={step.id} className="relative flex items-start gap-6">
                  {/* Connecting line */}
                  {index !== steps.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px -ml-px h-[calc(100%+3rem)] bg-white/10">
                      {isCompleted && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ duration: 0.5 }}
                          className="w-full bg-primary"
                        />
                      )}
                    </div>
                  )}
                  
                  {/* Icon circle */}
                  <div className="relative z-10 flex items-center justify-center">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? 'rgba(92, 107, 192, 0.2)' : isCompleted ? '#5c6bc0' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isActive || isCompleted ? '#5c6bc0' : 'rgba(255, 255, 255, 0.1)',
                        scale: isActive ? 1.1 : 1
                      }}
                      className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'shadow-[0_0_20px_rgba(92,107,192,0.4)]' : ''}`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : isActive && status !== 'ready' ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      ) : (
                        <step.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                      )}
                    </motion.div>
                  </div>

                  <div className="pt-2">
                    <h3 className={`text-xl font-semibold mb-1 transition-colors ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {(status === "ready" || status === "completed") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <div className="inline-block bg-white/5 border border-success/20 rounded-2xl px-8 py-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Pickup Code</p>
                <p className="text-4xl font-mono font-bold tracking-widest text-success">
                  {orderDetails.order_id}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </main>
  );
}

export default function TrackPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-primary mt-20" size={32}/></div>}>
        <TrackPageContent />
      </Suspense>
    </div>
  );
}
