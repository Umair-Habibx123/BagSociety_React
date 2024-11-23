// import React from 'react';

// const orders = [
//     {
//         id: '1108610663769910',
//         storeName: 'BIN YI NO1 Store',
//         productName: 'Japanese Anime Punk Gojo Satoru Printed Loose T-shirt Harajuku Casu...',
//         variant: 'Black, L',
//         price: '7.42',
//         quantity: 1,
//         orderDate: 'Nov 1, 2024',
//         status: 'Completed',
//         image: 'https://via.placeholder.com/100', // Replace with actual image URL
//     },
//     {
//         id: '1108610663789910',
//         storeName: 'Shop910329028 Store',
//         productName: 'Thorfin Vinland Saga Winrando Saga hoodies women funny gothic Hoo...',
//         variant: '15576, L',
//         price: '13.24',
//         quantity: 1,
//         orderDate: 'Nov 1, 2024',
//         status: 'Completed',
//         image: 'https://via.placeholder.com/100', // Replace with actual image URL
//     },
// ];

// const OrderList = () => {
//     return (
//         <div className="bg-gray-100 min-h-screen p-4">
//             <div className="bg-white shadow-md rounded-lg p-4">
//                 <div className="flex justify-between items-center border-b pb-3">
//                     <div className="flex space-x-4">
//                         <button className="font-medium text-red-500 border-b-2 border-red-500">View all</button>
//                         <button className="font-medium text-gray-500">To pay (0)</button>
//                         <button className="font-medium text-gray-500">To ship (0)</button>
//                         <button className="font-medium text-gray-500">Shipped (0)</button>
//                         <button className="font-medium text-gray-500">Processed</button>
//                     </div>
//                     <input
//                         type="text"
//                         placeholder="Order ID, product or store name"
//                         className="border rounded-lg p-2 w-1/3"
//                     />
//                 </div>

//                 {orders.map((order) => (
//                     <div key={order.id} className="mt-4 bg-white p-4 shadow-md rounded-lg">
//                         <h3 className="font-semibold text-lg">{order.status}</h3>
//                         <div className="flex mt-2">
//                             <img src={order.image} alt="Product" className="w-20 h-20 rounded-lg object-cover" />
//                             <div className="ml-4 flex-1">
//                                 <h4 className="font-semibold">{order.storeName}</h4>
//                                 <p className="text-gray-600 text-sm">{order.productName}</p>
//                                 <p className="text-gray-500 text-sm">Variant: {order.variant}</p>
//                                 <p className="text-gray-600 text-sm">US ${order.price} x {order.quantity}</p>
//                             </div>
//                             <div className="text-right">
//                                 <p className="text-gray-500 text-sm">Order date: {order.orderDate}</p>
//                                 <p className="text-gray-500 text-sm">Order ID: {order.id}</p>
//                                 <button className="text-blue-500 text-sm underline">Copy</button>
//                                 <button className="block bg-orange-500 text-white px-4 py-2 rounded mt-2">Add to cart</button>
//                                 <button className="block bg-gray-300 text-black px-4 py-2 rounded mt-2">Remove</button>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default OrderList;
