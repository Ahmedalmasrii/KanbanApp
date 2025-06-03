import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // Axios för API-anrop
import dayjs from 'dayjs'; // Datumformattering
import * as XLSX from 'xlsx'; // Exportera till Excel
import { useNavigate } from 'react-router-dom'; // För navigering

const AuditTrail = () => {
  // State för audit-loggar, filtrerade loggar, laddningsstatus, sökfält och datumfilter
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const navigate = useNavigate();

  // Hämtar alla loggar från backend när komponenten laddas
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/activity/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data); // Spara loggar
        setFilteredLogs(res.data); // Visa direkt
        setLoading(false);
      } catch (err) {
        console.error('Kunde inte hämta loggar');
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Funktion för filtrering utifrån sökfält och datumfilter
  const handleSearch = () => {
    const filtered = logs.filter(log => {
      const searchMatch =
        search === '' ||
        (log.user && log.user.username.toLowerCase().includes(search.toLowerCase())) ||
        log.action.toLowerCase().includes(search.toLowerCase());

      const date = dayjs(log.timestamp).format('YYYY-MM-DD');
      const fromMatch = !fromDate || date >= fromDate;
      const toMatch = !toDate || date <= toDate;

      return searchMatch && fromMatch && toMatch;
    });

    setFilteredLogs(filtered);
  };

  // Funktion för export till Excel
  const exportToExcel = () => {
    const worksheetData = filteredLogs.map(log => ({
      Tidpunkt: dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      Användare: log.user ? `${log.user.username} (${log.user.role})` : 'Okänd',
      Händelse: log.action
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AuditTrail');
    XLSX.writeFile(workbook, 'AuditTrail.xlsx');
  };

  // Funktion för utskrift (öppnar webbläsarens print-dialog)
  const handlePrint = () => {
    window.print();
  };

  // Gå tillbaka till Kanban-sidan
  const handleBack = () => {
    navigate('/kanban');
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      {/* Header med titel och tillbaka-knapp */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">🧾 Audit Trail</h1>
        <button
          onClick={handleBack}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded shadow-sm transition"
        >
          🔙 Tillbaka
        </button>
      </div>

      {/* Filtersektion för sökning och datum */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mb-6">
        {/* Sökfält */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="search" className="text-sm">🔍</label>
          <input
            id="search"
            type="text"
            placeholder="Sök användare eller händelse"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 rounded-md border border-gray-500 bg-gray-100 text-black w-full sm:w-56"
          />
        </div>

        {/* Från-datum */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="fromDate" className="text-sm">📅 Från</label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="p-2 rounded-md border border-gray-500 bg-gray-100 text-black w-full sm:w-auto"
          />
        </div>

        {/* Till-datum */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="toDate" className="text-sm">📅 Till</label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="p-2 rounded-md border border-gray-500 bg-gray-100 text-black w-full sm:w-auto"
          />
        </div>

        {/* Filtrera-knapp */}
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow-sm transition w-full sm:w-auto"
        >
          🔍 Filtrera
        </button>

        {/* Exportera till Excel-knapp */}
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-sm transition w-full sm:w-auto"
        >
          📥 Exportera till Excel
        </button>

        {/* Skriv ut-knapp */}
        <button
          onClick={handlePrint}
          className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded shadow-sm transition w-full sm:w-auto"
        >
          🖨️ Skriv ut
        </button>
      </div>

      {/* Logg-tabell */}
      {loading ? (
        <p>Hämtar loggar...</p>
      ) : (
        <div className="overflow-x-auto bg-slate-800 rounded shadow-lg p-4">
          <table className="table-auto w-full text-sm">
            <thead className="text-left text-indigo-300 border-b border-indigo-500">
              <tr>
                <th className="py-2 px-3">Tidpunkt</th>
                <th className="py-2 px-3">Användare</th>
                <th className="py-2 px-3">Händelse</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700">
                  <td className="py-2 px-3 text-gray-300">
                    {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </td>
                  <td className="py-2 px-3 font-semibold text-indigo-400">
                    {log.user ? `${log.user.username} (${log.user.role})` : 'Okänd'}
                  </td>
                  <td className="py-2 px-3 text-white">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
