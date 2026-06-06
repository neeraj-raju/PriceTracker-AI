const cards = [
{
title:"Instant Price Alerts",
text:"Get email alerts instantly when product prices drop."
},
{
title:"Analytics",
text:"Visualize historical price changes beautifully."
},
{
title:"24/7 Tracking",
text:"Continuous monitoring using automated schedulers."
},
{
title:"Secure Platform",
text:"JWT secured APIs and protected data."
}
];

export default function FeaturesSection() {

return (

<section id="features" className="bg-black px-8 py-28">

<div className="max-w-7xl mx-auto">

<h2
className="
text-5xl
font-bold
text-center
mb-5
"
>
Powerful Features
</h2>

<p
className="
text-gray-400
text-center
mb-16
text-lg
"
>
Everything you need for premium price tracking
</p>

<div
className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-8
"
>

{cards.map((card)=>(

<div
key={card.title}
className="
bg-gradient-to-br
from-[#071414]
to-[#021010]
border
border-[#123]
rounded-3xl
p-8
hover:scale-105
transition
duration-300
"
>

<h3
className="
text-2xl
font-bold
mb-5
"
>
{card.title}
</h3>

<p
className="
text-gray-400
leading-relaxed
"
>
{card.text}
</p>

</div>

))}

</div>

</div>

</section>

);

}