import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useContext, useState, useEffect } from 'react';
import { SellerMarketContext } from "../../../context/seller-market/SellerMarketContext";

const Teams = () => {
  const {teamUserInfo} = useContext(SellerMarketContext);
  const [isExpanded, setIsExpanded] = useState(false);
  
  

  const headers = ["Name", "Email", "Phone", "Role", "Actions"];

  return (
    <div className="border-t border-gray-200 rounded-md shadow-sm bg-white">
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-blue-600 text-sm font-semibold">Team</h2>
        <div className="bg-gray-120 rounded-full p-1.5">
          {isExpanded ? (
            <ChevronUp size={18} className="text-black" />
          ) : (
            <ChevronDown size={18} className="text-black" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-[#bdf5f8] text-xs uppercase font-medium text-black">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="py-2 px-3 text-left tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamUserInfo.map((userInfo, index) => (
                <tr
                  key={userInfo.id}
                  className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200"}
                >
                  <td className="py-2 px-3 font-medium text-gray-900 text-xs">{userInfo.firstName} {userInfo.lastName}</td>
                  <td className="py-2 px-3 text-xs text-blue-600">{userInfo.email}</td>
                  <td className="py-2 px-3 text-xs text-gray-900">{userInfo.phoneNumber}</td>
                  <td className="py-2 px-3 text-xs text-gray-700">{userInfo.role.join(",")}</td>
                  <td className="py-2 px-3 flex space-x-3 pr-6">
                    <Pencil />
                    <Trash2 />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Teams;
