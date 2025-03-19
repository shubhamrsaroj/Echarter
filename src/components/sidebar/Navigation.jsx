// import React from "react";
// import { NavItem } from "./NavItem";
// import { LayoutGrid, Building2, Users, Settings } from "lucide-react";

// const navigation = [
//   { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
//   { name: "Aircraft", href: "/aircraft", icon: Users },
//   { name: "Companies", href: "/companies", icon: Building2 },
//   { name: "My People", href: "/people", icon: Users },
//   { name: "Operators", href: "/operators", icon: Users },
//   { name: "Settings", href: "/settings", icon: Settings },
// ];

// const Navigation = ({ isOpen }) => {
//   return (
//     <div className="flex flex-col space-y-1">
//       {navigation.map((item) => (
//         <NavItem
//           key={item.name}
//           to={item.href}
//           icon={item.icon}
//           isOpen={isOpen}
//         >
//           {item.name}
//         </NavItem>
//       ))}
//     </div>
//   );
// };

// export default Navigation;