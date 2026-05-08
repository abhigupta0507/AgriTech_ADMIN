import { useEffect, useState } from "react";
import { api } from "../services/api";
import CreateEmployeeModal from "../components/modals/CreateEmployeeModal";
import EmployeeDetailModal from "../components/modals/EmployeeDetailModal";

function getBadgeClass(status) {
  switch (status) {
    case "verified":
      return "badge-verified";
    case "rejected":
      return "badge-rejected";
    default:
      return "badge-pending";
  }
}

export default function EmployeesPage({ token }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const data = await api.getEmployees(token, params);
      setEmployees(data.employees || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [statusFilter]);

  const handleViewDetails = async (id) => {
    try {
      const data = await api.getEmployee(token, id);
      setSelectedEmployee(data.employee);
      setShowDetailModal(true);
    } catch (error) {
      alert("Failed to load employee details");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await api.deleteEmployee(token, id);
      alert("Employee deleted successfully");
      loadEmployees();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <p className="page-subtitle">Manage all government employees</p>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">All Employees</h2>
          <button className="btn-secondary" onClick={() => setShowCreateModal(true)}>
            + Create Employee
          </button>
        </div>

        <div className="search-filter">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && loadEmployees()}
          />
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-secondary" onClick={loadEmployees}>
            Search
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <span className="spinner"></span>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No Employees Found</h3>
            <p className="empty-text">Create your first employee to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Phone</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.phone}</td>
                    <td>{employee.name || "-"}</td>
                    <td>{employee.designation || "-"}</td>
                    <td>{employee.department}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(employee.verificationStatus)}`}>
                        {employee.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewDetails(employee._id)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {employee.profileComplete && employee.verificationStatus === "pending" && (
                          <button
                            className="btn-icon btn-verify"
                            onClick={() => handleViewDetails(employee._id)}
                            title="Verify"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(employee._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateEmployeeModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadEmployees}
        />
      )}

      {showDetailModal && (
        <EmployeeDetailModal
          token={token}
          employee={selectedEmployee}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
          onVerified={loadEmployees}
        />
      )}
    </div>
  );
}
