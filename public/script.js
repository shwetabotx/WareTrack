async function addProduct(){

const name=document.getElementById("name").value
const sku=document.getElementById("sku").value
const category=document.getElementById("category").value
const stock=document.getElementById("stock").value
const location=document.getElementById("location").value

await fetch("/products",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({name,sku,category,stock,location})
})

loadProducts()

}

async function loadProducts(){

const res=await fetch("/products")
const products=await res.json()

const list=document.getElementById("productList")
list.innerHTML=""

products.forEach(p=>{
const li=document.createElement("li")
li.textContent=`${p.name} | Stock:${p.stock} | ${p.location}`
list.appendChild(li)
})

}

loadProducts()

async function receiveStock(){

const productId=document.getElementById("productId").value
const quantity=document.getElementById("quantity").value

await fetch("/receipts",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({productId,quantity})
})

alert("Stock Added")

}