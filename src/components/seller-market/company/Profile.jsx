import {
  Globe,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  SquareArrowOutUpRight,
  FileDown,
  LogIn,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { SellerMarketContext } from "../../../context/seller-market/SellerMarketContext";
import Reviews from "./Reviews";
import { navigationConfig } from "../common/navigation/navigationConfig";
import InfoModal from "../../common/InfoModal";


const Profile = () => {
  const { companyData } = useContext(SellerMarketContext);
  const [company, setCompany] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [localLoading, setLocalLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);

  const [isCertificatesExpanded, setIsCertificatesExpanded] = useState(false);
  const [isPublicFilesExpanded, setIsPublicFilesExpanded] = useState(false);
  const [isPrivateFilesExpanded, setIsPrivateFilesExpanded] = useState(false);

  const { companyId, getCompanyById } = useContext(SellerMarketContext);
  const [showReview, setShowReview] = useState(false);
  const { getTrustScoreInfo } = useContext(SellerMarketContext);
  const { getInfo } = useContext(SellerMarketContext);
  const [showModal, setShowModal] = useState(false);  

  const [activeTab, setActiveTab] = useState(navigationConfig.Company.subtabs);

  if (showReview) {
    // Show only Review UI — no Profile content here
    return <Reviews onBack={() => {
      setShowReview(false)}} />;
  }

  return (
    <div className="bg-white p-6">
      <div className="flex items-start justify-between space-x-4 mb-6">
        {/* Company Logo */}

        {/* Company Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {companyData?.name}
          </h2>
          <h1 className="text-sm text-gray-700">{companyData?.roles}</h1>
        </div>

        <img
          src={companyData?.logo} // replace with your actual logo field
          alt="Company Logo"
          className="w-12 h-12 object-contain rounded"
        />
      </div>

      <div className="flex space-x-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {companyData?.headline || "headline"}
        </h2>
        <Pencil />
      </div>
      <div className="bg-gray-100 rounded-lg border pr-6 pb-6 pl-0 mb-5 items-start">
        {companyData?.description}
      </div>

      <div className="flex space-x-10 mb-6">
        {/* Contact Details */}
        <div className="bg-gray-100 rounded-lg shadow-sm border px-8 py-3">
          <div className="flex space-x-5 items-center mb-2 whitespace-nowrap">
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Details
            </h2>
            <Pencil />
          </div>

          <div className="flex items-center space-x-4 p-1">
            <Mail />
            <span>{companyData?.email}</span>
          </div>

          <div className="flex items-center space-x-4 p-1">
            <Phone />
            <span>{companyData?.phone}</span>
          </div>

          <div className="flex items-start space-x-4 p-1">
            {/* Prevent shrinking of the icon */}
            <MapPin className="mt-1 flex-shrink-0 w-5 h-5" />

            {/* Allow text container to grow */}
            <div className="flex flex-col text-sm leading-tight flex-1">
              <span>{companyData?.street}</span>
              <span>
                {companyData?.city}&nbsp;&nbsp;{companyData?.state}
              </span>
              <span>
                {companyData?.zip}&nbsp;&nbsp;{companyData?.country}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-1">
            <Globe />
            <span>{companyData?.web}</span>
          </div>
        </div>

        {/* Trust Score */}
        <div className="w-full bg-gray-100 rounded-lg shadow-sm border p-4">
          <div className="flex space-x-8 items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Trust Score
              </h2>
              <p
                className="text-sm text-blue-600 cursor-pointer mb-0"
                onClick={() => {
                  setActiveTab("Reviews");
                  setShowReview(true);
                }} // Show Review UI
              >
                Reviews
              </p>
              <p
                className="text-sm text-blue-600 cursor-pointer"
                onClick={getTrustScoreInfo} // directly call context function
              >
                How to improve trust score
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Progress bar container */}
              <div className="relative w-24 h-4 rounded-full border-2 border-black overflow-hidden flex">
                {/* Filled yellow portion */}
                <div
                  className="bg-yellow-500 h-full rounded-l-full"
                  style={{ width: `${companyData?.rankOverall}%` }}
                />
                {/* Remaining black portion */}
                <div
                  className="bg-black h-full rounded-r-full flex-grow"
                  style={{ width: `${100 - (companyData?.rankOverall || 0)}%` }}
                />
              </div>

              {/* Rank text next to progress bar */}
              <p className="text-md font-semibold text-black ml-2 whitespace-nowrap">
                {companyData?.rankOverall}%
              </p>

              {/* Info icon */}
              <Info
                className="w-6 h-6 text-gray-600 cursor-pointer"
                onClick={() => {
                  setShowModal(true);
                }}
              />
              
            </div>
          </div>

          <div className="mt-2 text-sm space-y-1">
            <div>
              <span>Average Rating</span> :{" "}
              <span>{companyData?.averageRating}</span>
            </div>
            <div>
              <span>Total Reviews</span> : <span>{companyData?.totalReviews}</span>
            </div>
            <div>
              <span>dealsDone</span> : <span>{companyData?.dealsDone}</span>
            </div>
            <div>
              <span>dealsDeclined</span> : <span>{companyData?.dealsDeclined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="mb-6 border-t border-gray-200">
        {/* Header: Title + Add + Info + Expand toggle */}
        <div
          className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50"
          onClick={() => setIsCertificatesExpanded(!isCertificatesExpanded)}
        >
          <div className="flex items-center space-x-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Certificates
            </h2>
            <Plus
              className="w-8 h-8 text-white rounded-full flex items-center justify-center hover:bg-lime-300 transition-colors"
              style={{ backgroundColor: "#c1ff72" }}
              onClick={(e) => {
                e.stopPropagation();
                // handle Add Certificate click here
                alert("Add Certificate clicked");
              }}
            />
            <Info
              className="w-8 h-8"
              onClick={(e) => {
                e.stopPropagation();
                // handle Info click here
                alert("Info clicked");
              }}
            />
          </div>

          <div className="flex items-center">
            {isCertificatesExpanded ? (
              <ChevronUp size={18} className="text-black" />
            ) : (
              <ChevronDown size={18} className="text-black" />
            )}
          </div>
        </div>

        {/* Table shown only if expanded */}
        {isCertificatesExpanded && (
          <div className="overflow-x-auto border-t border-gray-300">
            <table className="min-w-full bg-white text-sm rounded-b-md">
              <thead className="bg-[#bdf5f8] text-xs uppercase font-medium text-black tracking-wider">
                <tr>
                  {/* <th className="py-2 px-4 text-left">Certificate Name</th> */}
                  {/* Add more headers if needed */}
                  {/* <th className="py-2 px-4 text-right">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {companyData.certificates.map((cert, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {cert.name}
                    </td>
                    <td className="px-4 py-2.5 flex justify-end pr-6 space-x-3">
                      <Pencil
                        className="cursor-pointer text-gray-700 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // handle edit certificate here
                          alert(`Edit certificate: ${cert.name}`);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Public */}
      <div className="mb-6 border-t border-gray-200">
        {/* Header: Title + Add + Expand toggle */}
        <div
          className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50"
          onClick={() => setIsPublicFilesExpanded(!isPublicFilesExpanded)}
        >
          <div className="flex items-center space-x-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Public Files
            </h2>
            <Plus
              className="w-8 h-8 text-white rounded-full flex items-center justify-center hover:bg-lime-300 transition-colors"
              style={{ backgroundColor: "#c1ff72" }}
              onClick={(e) => {
                e.stopPropagation();
                // Add your add file logic here
                alert("Add Private File clicked");
              }}
            />
            <Info
              className="w-8 h-8"
              onClick={(e) => {
                e.stopPropagation();
                // handle Info click here
                alert("Info clicked");
              }}
            />
          </div>

          <div className="flex items-center">
            {isPublicFilesExpanded ? (
              <ChevronUp size={18} className="text-black" />
            ) : (
              <ChevronDown size={18} className="text-black" />
            )}
          </div>
        </div>

        {/* Table only visible if expanded */}
        {isPublicFilesExpanded && (
          <div className="overflow-x-auto border-t border-gray-300">
            <table className="min-w-full bg-white text-sm rounded-b-md">
              <thead className="bg-[#bdf5f8] text-xs uppercase font-medium text-black tracking-wider"></thead>
              <tbody>
                {companyData.publicFiles.map((file, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {file.doc_type}
                    </td>
                    <td className="px-4 py-2.5">{file.createdBy}</td>
                    <td className="px-4 py-2.5">
                      {new Date(file.createdDate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replaceAll(" ", " ")}
                    </td>
                    <td className="px-4 py-2.5 flex justify-end space-x-6">
                      <SquareArrowOutUpRight
                        className="cursor-pointer text-gray-700 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Open file: ${file.name}`);
                        }}
                      />
                      <FileDown
                        className="cursor-pointer text-gray-700 hover:text-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Download file: ${file.name}`);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* private */}
      <div className="mb-6 border-t border-gray-200">
        {/* Header: Title + Add + Expand toggle */}
        <div
          className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50"
          onClick={() => setIsPrivateFilesExpanded(!isPrivateFilesExpanded)}
        >
          <div className="flex items-center space-x-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Private Files
            </h2>
            <Plus
              className="w-8 h-8 text-white rounded-full flex items-center justify-center hover:bg-lime-300 transition-colors"
              style={{ backgroundColor: "#c1ff72" }}
              onClick={(e) => {
                e.stopPropagation();
                // Add your add file logic here
                alert("Add Private File clicked");
              }}
            />
          </div>

          <div className="flex items-center">
            {isPrivateFilesExpanded ? (
              <ChevronUp size={18} className="text-black" />
            ) : (
              <ChevronDown size={18} className="text-black" />
            )}
          </div>
        </div>

        {/* Table only visible if expanded */}
        {isPrivateFilesExpanded && (
          <div className="overflow-x-auto border-t border-gray-300">
            <table className="min-w-full bg-white text-sm rounded-b-md">
              <thead className="bg-[#bdf5f8] text-xs uppercase font-medium text-black tracking-wider"></thead>
              <tbody>
                {companyData.privateFiles.map((file, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {file.doc_type}
                    </td>
                    <td className="px-4 py-2.5">{file.createdBy}</td>
                    <td className="px-4 py-2.5">
                      {new Date(file.createdDate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replaceAll(" ", " ")}
                    </td>
                    <td className="px-4 py-2.5 flex justify-end space-x-6">
                      <SquareArrowOutUpRight
                        className="cursor-pointer text-gray-700 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Open file: ${file.name}`);
                        }}
                      />
                      <FileDown
                        className="cursor-pointer text-gray-700 hover:text-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Download file: ${file.name}`);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <InfoModal
          onBack={() => {
            setShowModal(false); // Close modal
          }}
        />
      )}
    </div>
  );
};

export default Profile;
