"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Dropzone } from "@/components/ui/dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FileText, Settings2, Trash2, CheckCircle2, PlusCircle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const ADDONS = [
  { id: "Pen", price: 0.50 }, { id: "Pencil", price: 0.20 }, { id: "Eraser", price: 0.30 },
  { id: "Sharpener", price: 0.40 }, { id: "Highlighter", price: 1.00 }, { id: "Marker", price: 1.20 },
  { id: "Sticky notes", price: 1.50 }, { id: "Notebook", price: 3.00 }, { id: "Exam pad", price: 2.50 },
  { id: "Spiral binding", price: 2.00 }, { id: "Comb binding", price: 1.50 }, { id: "File cover", price: 0.80 },
  { id: "Transparent sheets", price: 0.50 }, { id: "Report file", price: 1.00 }, { id: "Paper clips", price: 0.50 },
  { id: "Binder clips", price: 0.80 }, { id: "Stapler / staples", price: 2.00 }, { id: "A4 sheets", price: 0.05 },
  { id: "Colored paper", price: 0.10 }, { id: "Photo paper", price: 0.50 }, { id: "Envelopes", price: 0.20 },
  { id: "Glue stick", price: 0.80 }, { id: "Tape", price: 1.00 }, { id: "Correction fluid", price: 1.50 },
  { id: "Scissors", price: 2.50 }, { id: "Printed report + binding", price: 5.00 },
  { id: "File cover + transparent sheets", price: 1.50 }, { id: "Complete project kit", price: 10.00 }
];

import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState<"bw" | "color">("bw");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to upload an order.");
      router.push("/login");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/orders/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any).accessToken}` 
        },
        body: JSON.stringify({
          user_id: session.user.email,
          file_path: file?.name || "document.pdf",
          copies: copies,
          print_type: color,
          addons: selectedAddons
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
        setShowSuccess(true);
      } else {
        toast.error("Failed to submit order. Please check backend.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error connecting to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (orderDetails) {
      router.push(`/track?order_id=${orderDetails.order_id}`);
    } else {
      router.push("/");
    }
  };

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : "0";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Document</h1>
          <p className="text-gray-400">Configure your print settings and get queued automatically by our smart engine.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {!file ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Dropzone onFileSelect={setFile} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                      <p className="text-sm text-gray-400">{fileSizeMB} MB • PDF</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 size={20} />
                  </Button>
                </Card>
              </motion.div>
            )}

            {file && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card>
                  <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                    <Settings2 className="text-primary" size={20} />
                    <h2 className="text-lg font-semibold">Print Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Copies</label>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setCopies(Math.max(1, copies - 1))}>-</Button>
                        <Input 
                          type="number" 
                          value={copies} 
                          onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24 text-center text-lg font-mono font-medium" 
                        />
                        <Button variant="outline" size="icon" onClick={() => setCopies(copies + 1)}>+</Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Color Mode</label>
                      <div className="flex bg-white/5 rounded-xl p-1 w-full max-w-xs border border-white/10">
                        <button 
                          onClick={() => setColor("bw")}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${color === "bw" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                        >
                          Black & White
                        </button>
                        <button 
                          onClick={() => setColor("color")}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${color === "color" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                        >
                          Color
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <PlusCircle className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Add Extras (Options)</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}>
                      {ADDONS.map(addon => {
                        const isSelected = selectedAddons.includes(addon.id);
                        return (
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={addon.id}
                            onClick={() => {
                              if (isSelected) setSelectedAddons(prev => prev.filter(x => x !== addon.id));
                              else setSelectedAddons(prev => [...prev, addon.id]);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-colors flex flex-col justify-between min-h-[85px] ${isSelected ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(92,107,192,0.15)] text-white' : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-300'}`}
                          >
                            <div className="flex justify-between items-start mb-2 gap-1 overflow-hidden">
                              <span className="text-[13px] font-medium leading-tight line-clamp-2">{addon.id}</span>
                              {isSelected && <Check className="text-primary flex-shrink-0" size={14} />}
                            </div>
                            <span className="text-xs text-primary/80 font-mono font-bold mt-auto">+${addon.price.toFixed(2)}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                </Card>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card glass className="bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4">Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Document</span>
                    <span className="text-white truncate max-w-[120px]">{file ? file.name : "None"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Copies</span>
                    <span className="text-white">{copies}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mode</span>
                    <span className="text-white">{color === "bw" ? "B&W" : "Color"}</span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between text-sm items-start pt-2 border-t border-white/5 mt-2">
                      <span className="text-gray-400">Add-ons ({selectedAddons.length})</span>
                      <span className="text-white font-mono">+${selectedAddons.reduce((acc, a) => acc + (ADDONS.find(x => x.id === a)?.price || 0), 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Estimated Total</span>
                    <span className="text-xl font-bold font-mono">
                      ${((copies * (color === "bw" ? 0.10 : 0.50)) + selectedAddons.reduce((acc, a) => acc + (ADDONS.find(x => x.id === a)?.price || 0), 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full text-lg shadow-[0_0_20px_0_rgba(92,107,192,0.4)]"
                  disabled={!file || isUploading}
                  isLoading={isUploading}
                  onClick={handleSubmit}
                >
                  Confirm & Print
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={showSuccess} onClose={handleSuccessClose}>
        <div className="text-center py-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Order Queued!</h2>
          <p className="text-gray-400 mb-8">
            Your document has been sent to an auto-assigned shop.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Queue No.</p>
              <p className="text-2xl font-mono font-bold text-white">#{orderDetails?.queue_number || "..."}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-2xl font-mono font-bold text-white">#{orderDetails?.order_id || "..."}</p>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={handleSuccessClose}>
            Track Order
          </Button>
        </div>
      </Modal>
    </div>
  );
}
