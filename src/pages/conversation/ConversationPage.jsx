// import React, { useState } from "react";
// import MessageItem from "../../components/Conversation/ConversationItem/MessageItem";
// import EmailItem from "../../components/conversation/ConversationItem/EmailItem";

// const ConversationPage = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="p-10 w-full mx-auto">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Conversations</h1>

//       <div className="space-y-6">
//         <MessageItem title="Itinerary Text - Company Name" notificationCount={2} />
//         <EmailItem title="Itinerary Text - Company Name" notificationCount={2} />
//       </div>

//       {/* Button to Open Modal */}
//       <button
//         className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         onClick={() => setIsOpen(true)}
//       >
//         Open InstaCharter
//       </button>

//       {/* Modal */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-5 rounded-lg shadow-lg w-3/4 h-3/4 relative">
//             {/* Close Button */}
//             <button
//               className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-xl"
//               onClick={() => setIsOpen(false)}
//             >
//               &times;
//             </button>

//             {/* instacharter */}
//             <iframe
//               src="https://www.instacharter.app/"
//               className="w-full h-full border-none"
//               title="InstaCharter"
//             ></iframe>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ConversationPage;
