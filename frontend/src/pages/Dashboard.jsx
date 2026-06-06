import {

LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer

}
from "recharts";

import {
LayoutDashboard,
Package,
Bell,
Search,
TrendingDown,
Box,
LogOut
} from "lucide-react";

import {
useEffect,
useState
} from "react";

import {
useNavigate,
useLocation
} from "react-router-dom";

import {
trackProduct,
getProducts,
removeProduct,
getPriceHistory,
getStats,
triggerTestAlert,
getVapidPublicKey,
subscribeToPush,
getAlerts
}
from "../services/productService";

export default function Dashboard() {
    const navigate = useNavigate()
    const location = useLocation()

   const handleLogout = ()=>{

   localStorage.clear();

   navigate("/login",{replace:true})

   }

const [url,setUrl]=useState("");
const [targetPrice, setTargetPrice]=useState("");
const [alertPreference, setAlertPreference]=useState("EMAIL");

const [products,setProducts]=useState([]);
const [stats,
setStats]=useState({

trackedProducts:0,

priceDrops:0,

alertsSent:0

});
const [alerts, setAlerts] = useState([]);
const [search,
setSearch]=useState("");
const [priceHistory,
setPriceHistory]=useState({});

const [selectedProduct,
setSelectedProduct]=useState(
null
);
const [loading,
setLoading]=useState(false)
const [activeSection,
setActiveSection]=useState("dashboard")

useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const sectionParam = queryParams.get("section");
  if (sectionParam) {
    setActiveSection(sectionParam);
  }
}, [location.search]);

const loadProducts = async()=>{

try{

const data =
await getProducts();

console.log("PRODUCT DATA:",data);

if (Array.isArray(data)) {
  setProducts(data);
} else {
  setProducts([]);
}

}
catch(error){

console.log(
"LOAD ERROR:",
error
);
setProducts([]);

}

};

  const registerPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log("Push messaging is not supported in this browser.");
      return;
    }

    try {
      // 1. Register the Service Worker sw.js
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log("[SW] Service Worker registered successfully!");

      // 2. Request Notification Permissions
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn("[Push] Permission not granted for notifications.");
        return;
      }

      // 3. Get VAPID Public Key from backend
      const vapidKeyData = await getVapidPublicKey();
      const publicVapidKey = vapidKeyData.publicKey;

      if (!publicVapidKey) {
        console.warn("[Push] VAPID public key is empty. Server might not be initialized yet.");
        return;
      }

      // Convert VAPID public key (Base64URL) to Uint8Array for PushManager
      const padding = '='.repeat((4 - publicVapidKey.length % 4) % 4);
      const base64 = (publicVapidKey + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      // 4. Subscribe the User to Push service
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray
        });
        console.log("[Push] New push subscription created successfully!");
      } else {
        console.log("[Push] Existing push subscription found.");
      }

      // 5. Send subscription data to the backend
      const subJson = subscription.toJSON();
      await subscribeToPush({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth
        }
      });
      console.log("[Push] Browser subscription registered securely with backend!");
    } catch (error) {
      console.error("[Push] Error during Web Push registration flow: ", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    loadProducts();
    loadStats();
    registerPushNotifications();
  }, []);
const loadStats=
async()=>{

try{

const data=

await getStats();

if (data && typeof data === "object") {
  setStats({
    trackedProducts: data.trackedProducts || 0,
    priceDrops: data.priceDrops || 0,
    alertsSent: data.alertsSent || 0
  });
}

}
catch(error){

console.log(
error
);

}

};

const loadAlerts = async () => {
  try {
    const data = await getAlerts();
    if (Array.isArray(data)) {
      setAlerts(data);
    } else {
      setAlerts([]);
    }
  } catch (error) {
    console.error("LOAD ALERTS ERROR:", error);
    setAlerts([]);
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getSavingsInfo = (oldPrice, newPrice) => {
  const oldVal = Number(oldPrice);
  const newVal = Number(newPrice);
  if (isNaN(oldVal) || isNaN(newVal) || oldVal <= 0) return null;
  const diff = oldVal - newVal;
  const percent = Math.round((diff / oldVal) * 100);
  return {
    diff: diff.toFixed(2),
    percent: percent
  };
};

useEffect(() => {
  if (activeSection === "alerts") {
    loadAlerts();
  }
}, [activeSection]);
const filteredProducts =

products.filter(
(product)=>{

if(
!search.trim()
){

return true;

}

return (
product.name || ""
)

.toLowerCase()

.includes(

search
.toLowerCase()

);

}
);
const handleTrack = async () => {

    if (!url.trim()) {

        alert("Enter product URL");

        return;

    }

    setLoading(true);

    try {

        await trackProduct(url, targetPrice, alertPreference);

        alert("Product Added Successfully");

        setUrl("");
        setTargetPrice("");
        setAlertPreference("EMAIL");

        await loadProducts();
        await loadStats();

    }

   catch(error){

   console.log(
   "TRACK ERROR:",
   error
   )

   console.log(
   "RESPONSE:",
   error.response
   )

   console.log(
   "DATA:",
   error.response?.data
   )

   alert(

   JSON.stringify(

   error.response?.data

   ||

   error.message

   )

   )

   }

    finally{

        setLoading(false);

    }

};
const handleRemove = async(id)=>{

try{

await removeProduct(id);

alert(
"Product Removed"
);

await loadProducts();
await loadStats();

}
catch(error){

console.log(error);

alert(
"Failed to Remove Product"
);

}

};
const handleSendTestAlert = async (id) => {
  try {
    await triggerTestAlert(id);
    alert("Test Price-Drop Alert Dispatched! Check your configured channel (Email or WhatsApp logs).");
    await loadProducts();
    await loadStats();
    if (selectedProduct === id) {
      await loadHistory(id);
    }
  } catch (error) {
    console.error("Test alert failed:", error);
    alert("Failed to trigger test alert.");
  }
};

const loadHistory=
async(productId)=>{

try{

const data=

await getPriceHistory(
productId
);

const formatted=

data.map(
(item)=>({

price:
Number(
item.newPrice
),

date:

new Date(
item.checkedAt
).toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"short"
}
)

})
);

setPriceHistory(
prev=>({

...prev,

[productId]:
formatted

})
);

setSelectedProduct(
productId
);

setTimeout(() => {
  document.getElementById('price-chart-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}, 100);

}
catch(error){

console.log(
error
);

}

};
return (

<div className="min-h-screen bg-black text-white flex">

{/* Sidebar */}

<div
className="
w-[280px]
bg-[#040404]
border-r
border-[#161616]
flex
flex-col
justify-between
px-7
py-8
"
>

<div>

<h1
className="
text-3xl
font-black
mb-10
whitespace-nowrap
bg-gradient-to-r
from-emerald-400
to-cyan-400
bg-clip-text
text-transparent
"
>

PriceTracker AI

</h1>

<div className="space-y-3">

<SidebarButton
icon={<LayoutDashboard size={22}/>}
name="Dashboard"
active={activeSection==="dashboard"}
onClick={()=>
setActiveSection("dashboard")
}
/>

<SidebarButton
icon={<Package size={22}/>}
name="Products"
active={activeSection==="products"}
onClick={()=>
setActiveSection("products")
}
/>

<SidebarButton
icon={<Bell size={22}/>}
name="Alerts"
active={activeSection==="alerts"}
onClick={()=>
setActiveSection("alerts")
}
/>

</div>

</div>

<button

onClick={handleLogout}

className="
flex
items-center
gap-3
text-red-400
hover:text-red-300
transition
font-medium
"
>

<LogOut size={20}/>

Logout

</button>

</div>

{/* Main */}

<div
className="
flex-1
px-10
py-8
overflow-auto
"
>

{/* Header */}

<div
className="
flex
justify-between
items-center
mb-8
"
>

<div>

<h1
className="
text-5xl
font-black
leading-none
"
>

Dashboard 🚀

</h1>

<p
className="
text-gray-400
mt-2
text-lg
"
>

Monitor products and price alerts

</p>

</div>

<div
className="
w-[350px]
bg-[#090909]
border
border-[#1c1c1c]
rounded-2xl
px-5
py-4
flex
items-center
gap-3
"
>

<Search
size={20}
className="text-gray-500"
/>

<input

value={search}

onChange={(e)=>

setSearch(
e.target.value
)

}

placeholder="Search products..."

className="
bg-transparent
outline-none
w-full
text-gray-300
"

/>

</div>

</div>
{
activeSection==="products" && (

<div
className="
bg-[#060606]
border
border-[#171717]
rounded-3xl
p-6
"
>

<h2
className="
text-3xl
font-black
mb-6
text-emerald-400
"
>

Products 📦

</h2>

<div
className="
space-y-4
"
>

{

products.length===0

?

(

<p
className="
text-gray-400
"
>

No products tracked yet

</p>

)

:

(

filteredProducts.map(
(product)=>(

<div

key={product.id}

className="
bg-black
border
border-[#222]
rounded-2xl
p-4
flex
justify-between
items-center
"

>

<div>

<h3
className="
font-bold
"
>

{product.name}

</h3>

<p
className="
text-emerald-400
"
>

₹ {product.currentPrice}

</p>

</div>

<button

onClick={()=>
handleRemove(product.id)
}

className="
bg-red-500
px-4
py-2
rounded-xl
"

>

Remove

</button>

</div>

)

)

)

}

</div>

</div>

)

}

{
activeSection==="alerts" && (

<div className="bg-[#060606] border border-[#171717] rounded-3xl p-6 shadow-lg shadow-emerald-500/5">
  <div className="flex justify-between items-center mb-8 border-b border-[#1f1f1f] pb-5">
    <div>
      <h2 className="text-3xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
        Alerts Inbox 🔔
      </h2>
      <p className="text-zinc-500 text-sm mt-1">Live chronological history of your price drop notifications</p>
    </div>
    <div className="bg-emerald-950/30 border border-emerald-900/50 px-4 py-2 rounded-xl text-emerald-400 font-bold text-sm">
      Total Dispatched: {stats.alertsSent}
    </div>
  </div>

  {alerts.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-55">📭</div>
      <h3 className="text-xl font-bold text-zinc-300">Your inbox is empty</h3>
      <p className="text-zinc-500 text-sm mt-1 max-w-sm">When the system detects a price drop below your target thresholds, alerts will show up here.</p>
    </div>
  ) : (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const savings = getSavingsInfo(alert.oldPrice, alert.newPrice);
        return (
          <div key={alert.id} className="bg-[#0c0c0c] border border-[#181818] hover:border-[#222] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-5 transition duration-300 shadow-md">
            {/* Product Thumbnail */}
            <div className="h-16 w-16 bg-black border border-[#222] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {alert.imageUrl ? (
                <img src={alert.imageUrl} alt={alert.productName} className="h-full w-full object-contain" />
              ) : (
                <span className="text-zinc-600 text-xl font-bold">{alert.website?.charAt(0)}</span>
              )}
            </div>

            {/* Notification Text */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  alert.website === 'AMAZON' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  alert.website === 'FLIPKART' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  alert.website === 'MYNTRA' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {alert.website}
                </span>
                <span className="text-zinc-500 text-xs">{formatTimeAgo(alert.checkedAt)}</span>
              </div>

              <h4 className="text-zinc-200 font-bold text-sm truncate max-w-xl hover:text-emerald-400 transition cursor-pointer" onClick={() => window.open(alert.productUrl || '#', '_blank')}>
                {alert.productName}
              </h4>

              {/* Price Drop Transition */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-zinc-500 line-through text-xs">₹{Number(alert.oldPrice).toLocaleString()}</span>
                <span className="text-zinc-500 text-xs">➔</span>
                <span className="text-emerald-400 font-extrabold text-sm">₹{Number(alert.newPrice).toLocaleString()}</span>
                
                {savings && (
                  <span className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-1">
                    🔥 -{savings.percent}% (Saved ₹{Math.floor(savings.diff)})
                  </span>
                )}
              </div>
            </div>

            {/* Channel Badge & Buy Button */}
            <div className="flex md:flex-col items-end gap-3 w-full md:w-auto border-t border-[#161616] md:border-t-0 pt-3 md:pt-0 justify-between md:justify-center flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-[#121212] border border-[#222] text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
                {alert.alertPreference === 'EMAIL' ? (
                  <>📧 <span className="text-[10px] uppercase font-bold">Email Sent</span></>
                ) : alert.alertPreference === 'PUSH' ? (
                  <>🔔 <span className="text-[10px] uppercase font-bold">Push Sent</span></>
                ) : (
                  <>🔄 <span className="text-[10px] uppercase font-bold">Email + Push</span></>
                )}
              </div>

              <a href={alert.productUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-4 py-2 rounded-xl text-xs transition text-center shadow-md shadow-emerald-500/10 w-auto">
                Buy Product ➔
              </a>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
)
}

{
activeSection==="dashboard" && (

<>

{/* Cards */}

<div
className="
grid
grid-cols-3
gap-5
mb-6
"
>

<Card
icon={<Box/>}
title="Active Watchlist"
value={
stats.trackedProducts
}
/>

<Card
icon={<TrendingDown/>}
title="Price Drops"
value={
stats.priceDrops
}
/>

<Card
icon={<Bell/>}
title="Alerts Sent"
value={
stats.alertsSent
}
/>

</div>

{/* Track Product */}

<div
className="
bg-[#060606]
border
border-[#171717]
rounded-3xl
p-6
mb-6
shadow-lg
shadow-emerald-500/5
"
>

<h2
className="
text-3xl
font-black
mb-5
"
>

Track Product

</h2>

<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
  <div className="md:col-span-6 flex flex-col gap-2">
    <label className="text-zinc-400 text-sm font-semibold">Product URL</label>
    <input
      value={url}
      onChange={(e)=> setUrl(e.target.value)}
      placeholder="Paste Amazon product URL here..."
      className="bg-black border border-[#242424] rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition text-zinc-300 w-full"
    />
  </div>
  <div className="md:col-span-3 flex flex-col gap-2">
    <label className="text-zinc-400 text-sm font-semibold">Target Price (₹ - Optional)</label>
    <input
      type="number"
      value={targetPrice}
      onChange={(e)=> setTargetPrice(e.target.value)}
      placeholder="Alert below price, e.g. 45000"
      className="bg-black border border-[#242424] rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition text-zinc-300 w-full"
    />
  </div>
  <div className="md:col-span-3 flex flex-col gap-2">
    <label className="text-zinc-400 text-sm font-semibold">Alert Preference</label>
    <select
      value={alertPreference}
      onChange={(e)=> setAlertPreference(e.target.value)}
      className="bg-black border border-[#242424] rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition text-zinc-300 w-full cursor-pointer"
    >
      <option value="EMAIL">📧 Email Only</option>
      <option value="PUSH">🔔 Web Push Only</option>
      <option value="BOTH">🔄 Both (Email + Web Push)</option>
    </select>
  </div>
</div>
<div className="flex justify-end mt-6">
  <button
    disabled={loading}
    onClick={handleTrack}
    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-10 py-4 rounded-2xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
  >
    {loading ? "Tracking Product..." : "Add Product to Tracking"}
  </button>
</div>
</div>

{/* Product List */}

<div
className="
bg-[#060606]
border
border-[#171717]
rounded-3xl
p-6
shadow-lg
shadow-emerald-500/5
"
>

<h2
className="
text-3xl
font-black
mb-6
"
>

Currently Tracking

</h2>

{

products.length===0

?

(

<div
className="
text-gray-500
text-center
py-12
text-lg
"
>

Your watchlist is currently empty

</div>

)

:

(

<div className="space-y-4">

{

filteredProducts.map(
(product)=>(

<div

key={product.id}

className="
bg-black
border
border-[#222]
rounded-3xl
p-5
flex
items-center
justify-between
hover:border-emerald-500
transition
"

>

<div
className="
flex
gap-5
items-center
"
>

<img

src={
product.imageUrl
}

alt={
product.name
}

className="
w-24
h-24
object-contain
bg-white
rounded-2xl
p-2
"

/>

<div>

<h3
className="
font-bold
text-lg
max-w-[450px]
"
>

{product.name}

</h3>

<p
className="
text-emerald-400
font-bold
mt-1
"
>

₹ {product.currentPrice}

</p>

<p
className="
text-gray-400
text-sm
"
>

Website: {product.website}

</p>

<p
className="
text-gray-400
text-sm
"
>

Availability: {

product.availability
||
"In Stock"

}

</p>
<p
className="
text-gray-400
text-sm
"
>

Last Checked:
{" "}

{

product.lastChecked

?

new Date(
product.lastChecked
).toLocaleString(
"en-IN",
{
dateStyle:"medium",
timeStyle:"short"
}
)
:

"Not Available"

}

</p>

</div>

</div>

<div
className="
flex
gap-2
"
>

<div className="flex items-center gap-2 bg-[#091a14] border border-[#164d36] text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm shadow-md">
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
  </span>
  Tracking
</div>

<button

onClick={()=>
loadHistory(
product.id
)
}

className="
bg-cyan-500
hover:bg-cyan-400
text-black
font-bold
px-4
py-2
rounded-xl
transition
"

>

Graph

</button>

<button

onClick={()=>
handleRemove(
product.id
)
}

className="
bg-red-500
hover:bg-red-400
text-white
font-bold
px-4
py-2
rounded-xl
transition
"

>

Remove

</button>

</div>

</div>

)
)

}

{
selectedProduct &&
priceHistory[selectedProduct] && (() => {
  const selectedProductObj = products.find(p => p.id === selectedProduct);
  const historyData = priceHistory[selectedProduct] || [];
  const pricesList = historyData.map(h => h.price);
  const lowestPrice = pricesList.length > 0 ? Math.min(...pricesList) : null;
  const highestPrice = pricesList.length > 0 ? Math.max(...pricesList) : null;
  const currentPrice = selectedProductObj?.currentPrice;

  return (
    <div id="price-chart-section" className="mt-8 bg-black border border-[#171717] rounded-3xl p-6 shadow-lg shadow-emerald-500/5">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border-b border-[#1f1f1f] pb-5">
        <div className="flex items-center gap-4 min-w-0">
          {selectedProductObj?.imageUrl && (
            <div className="h-14 w-14 bg-[#0c0c0c] border border-[#222] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={selectedProductObj.imageUrl} alt={selectedProductObj.name} className="h-full w-full object-contain" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {selectedProductObj?.website}
            </span>
            <h3 className="text-xl font-bold text-zinc-200 truncate max-w-lg mt-1">{selectedProductObj?.name}</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Historical price trend analysis</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#0c0c0c] border border-[#1f1f1f] px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Current Price</span>
            <span className="text-zinc-200 font-extrabold text-sm">₹{Number(currentPrice).toLocaleString()}</span>
          </div>
          {highestPrice && (
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Highest Price</span>
              <span className="text-red-400 font-extrabold text-sm">₹{Number(highestPrice).toLocaleString()}</span>
            </div>
          )}
          {lowestPrice && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-emerald-500 font-bold uppercase block">Lowest Price</span>
              <span className="text-emerald-400 font-extrabold text-sm">₹{Number(lowestPrice).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart View */}
      <div className="h-[320px] w-full mt-4 bg-[#050505] border border-[#121212] rounded-2xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0c0c0c', borderColor: '#222', borderRadius: '12px' }}
              itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
              labelStyle={{ color: '#9ca3af', fontSize: '11px' }}
            />
            <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={3} dot={{ r: 4, stroke: '#060606', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
})()}

</div>

)

}

</div>



</>

)

}

</div>

</div>

);

}

function SidebarButton({
icon,
name,
active=false,
onClick
}) {

return (

<button

onClick={onClick}

className={`

w-full
flex
items-center
gap-4
px-5
py-4
rounded-2xl
font-semibold
transition

${
active
?
"bg-emerald-500 text-black"
:
"hover:bg-[#111111]"
}

`}

>

{icon}

{name}

</button>

);

}

function Card({
icon,
title,
value
}) {

return (

<div

className="
bg-gradient-to-br
from-[#071414]
to-[#020707]
border
border-[#123333]
rounded-3xl
p-6
shadow-lg
shadow-emerald-500/5
"

>

<div
className="
text-emerald-400
mb-4
"
>

{icon}

</div>

<p
className="
text-gray-400
mb-3
"
>

{title}

</p>

<h2
className="
text-5xl
font-black
"
>

{value}

</h2>

</div>

);

}