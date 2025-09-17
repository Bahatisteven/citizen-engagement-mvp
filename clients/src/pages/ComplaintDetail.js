import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

// complaint detail page: shows full info and allows status change or responses
const ComplaintDetail = () => {
  const {
    complaints,
    addResponse,
    updateComplaintStatus,
    currentUser,
    getUserById
  } = React.useContext(AppContext);

  const [responseText, setResponseText] = useState('');  // text for new response
  const [error, setError] = useState('');               // error message for response
  const { complaintId } = useParams();                  // id from url params

  // find the complaint by id
  const complaint = complaints.find(c => c.id === complaintId);

  // determine who can respond
  const canRespond = currentUser && (
    currentUser.role === 'admin' ||
    (currentUser.role === 'institution' && currentUser.id === complaint?.assignedTo) ||
    (currentUser.role === 'citizen'     && currentUser.id === complaint?.citizen)
  );

  // determine who can change status
  const canChangeStatus = currentUser && (
    currentUser.role === 'admin' ||
    (currentUser.role === 'institution' && currentUser.id === complaint?.assignedTo)
  );

  // handle new response submission
  const handleSubmitResponse = e => {
    e.preventDefault();
    setError('');

    if (!responseText.trim()) {
      setError('response cannot be empty');
      return;
    }

    addResponse(complaintId, responseText);
    setResponseText('');
  };

  // handle status update
  const handleStatusChange = status => {
    updateComplaintStatus(complaintId, status);
  };

  // if complaint not found, show placeholder
  if (!complaint) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          complaint not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* header: title and status badge */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{complaint.title}</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              complaint.status === 'Open'          ? 'bg-yellow-100 text-yellow-800' :
              complaint.status === 'In Progress'   ? 'bg-blue-100 text-blue-800' :
                                                     'bg-green-100 text-green-800'
            }`}
          >
            {complaint.status}
          </span>
        </div>

        {/* basic info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">id</p>
            <p className="font-medium">{complaint.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">date submitted</p>
            <p>{complaint.createdAt}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">category</p>
            <p>{complaint.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">submitted by</p>
            <p>{getUserById(complaint.citizen)?.name || 'unknown'}</p>
          </div>
          {complaint.location && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">location</p>
              <p>{complaint.location}</p>
            </div>
          )}
        </div>

        {/* description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">description</p>
          <div className="bg-gray-50 p-4 rounded">
            {complaint.description}
          </div>
        </div>

        {/* status update buttons if allowed */}
        {canChangeStatus && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">update status</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusChange('Open')}
                className={`px-4 py-2 rounded ${
                  complaint.status === 'Open'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 hover:bg-yellow-100'
                }`}
              >
                open
              </button>
              <button
                onClick={() => handleStatusChange('In Progress')}
                className={`px-4 py-2 rounded ${
                  complaint.status === 'In Progress'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-blue-100'
                }`}
              >
                in progress
              </button>
              <button
                onClick={() => handleStatusChange('Resolved')}
                className={`px-4 py-2 rounded ${
                  complaint.status === 'Resolved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 hover:bg-green-100'
                }`}
              >
                resolved
              </button>
            </div>
          </div>
        )}

        {/* responses section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">responses and updates</h3>

          {/* list existing responses */}
          {complaint.responses.length > 0 ? (
            <div className="space-y-4 mb-6">
              {complaint.responses.map((response, idx) => {
                const responder = getUserById(response.from);
                const isInstitution = responder?.role === 'institution';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      isInstitution ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                    }`}
                  >
                    <p>{response.text}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-600">
                        from: {responder?.name || 'unknown'}
                      </p>
                      <p className="text-sm text-gray-600">{response.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-6">no responses yet</p>
          )}

          {/* response form if allowed */}
          {canRespond && (
            <div>
              <h4 className="font-medium mb-2">add response</h4>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmitResponse}>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  rows="3"
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="type your response here..."
                  required
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  submit response
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
