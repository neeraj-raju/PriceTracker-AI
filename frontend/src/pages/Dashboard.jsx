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
trackProduct,
getProducts,
removeProduct,
getPriceHistory
}
from "../services/productService";

export default function Dashboard() {

const [url,setUrl]=useState("");

const [products,setProducts]=useState([]);
const [search,
setSearch]=useState("");
const [priceHistory,
setPriceHistory]=useState({});

const [selectedProduct,
setSelectedProduct]=useState(
null
);

const loadProducts = async()=>{

try{

const data =
await getProducts();

console.log("PRODUCT DATA:",data);

setProducts(data);

}
catch(error){

console.log(
"LOAD ERROR:",
error
);

}

};

useEffect(()=>{

loadProducts();

},[]);

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

    try {

        await trackProduct(url);

        alert("Product Added Successfully");

        setUrl("");

        await loadProducts();

    }

    catch(error){

        console.log(error);

        if(
            error.response?.data?.message
        ){

            alert(
                error.response.data.message
            );

        }
        else{

            alert(
                "Failed to Track Product"
            );

        }

    }

};
const handleRemove = async(id)=>{

try{

await removeProduct(id);

alert(
"Product Removed"
);

await loadProducts();

}
catch(error){

console.log(error);

alert(
"Failed to Remove Product"
);

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
active
/>

<SidebarButton
icon={<Package size={22}/>}
name="Products"
/>

<SidebarButton
icon={<Bell size={22}/>}
name="Alerts"
/>

</div>

</div>

<button
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
title="Tracked Products"
value={
products.length
}
/>

<Card
icon={<TrendingDown/>}
title="Price Drops"
value="12"
/>

<Card
icon={<Bell/>}
title="Alerts Sent"
value="31"
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

<div className="flex gap-4">

<input

value={url}

onChange={(e)=>
setUrl(e.target.value)
}

placeholder="Paste Amazon URL..."

className="
flex-1
bg-black
border
border-[#242424]
rounded-2xl
px-5
py-4
outline-none
focus:border-emerald-500
transition
"
/>

<button

onClick={handleTrack}

className="
bg-emerald-500
hover:bg-emerald-400
text-black
font-bold
px-8
rounded-2xl
transition
shadow-lg
shadow-emerald-500/20
"

>

Track

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

Tracked Products

</h2>

<div
className="
text-gray-500
text-center
py-12
text-lg
"
>

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

No tracked products yet

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

<div

className="
bg-emerald-500
text-black
px-4
py-2
rounded-xl
font-bold
"

>

Tracked

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

priceHistory[
selectedProduct
] && (

<div
className="
mt-8
bg-black
rounded-3xl
p-6
border
border-[#222]
"
>

<h2
className="
text-2xl
font-bold
mb-6
"
>

Price Trend 📈

</h2>

<div
className="
h-[300px]
w-full
min-w-[500px]
"
>

<ResponsiveContainer>

<LineChart

data={
priceHistory[
selectedProduct
]
}

>

<XAxis
dataKey="date"
/>

<YAxis/>

<Tooltip/>

<Line

type="monotone"

dataKey="price"

stroke="#10B981"

strokeWidth={3}

/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

)

}
</div>

)

}

</div>

</div>

</div>

</div>

);

}

function SidebarButton({
icon,
name,
active=false
}) {

return (

<button

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