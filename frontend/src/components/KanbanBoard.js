import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Header from "./Header";
import OrderModal from "./OrderModal";
import NotificationToast from "./NotificationToast";
import dayjs from "dayjs";

// Mappar frontend-statusar till backend-statusar
const statusMap = {
  toDo: "todo",
  ordered: "ordered",
  delivered: "delivered",
};

const KanbanBoard = () => {
  // State för kolumnerna i kanban-brädan
  const [columns, setColumns] = useState({
    toDo: { name: "Att beställa", items: [] },
    ordered: { name: "Beställd", items: [] },
    delivered: { name: "Levererad", items: [] },
    assigned: { name: "Mina uppgifter", items: [] },
  });

  const [input, setInput] = useState(""); // State för ny beställning
  const [selectedOrder, setSelectedOrder] = useState(null); // För OrderModal
  const [searchTerm, setSearchTerm] = useState(""); // För sökning
  const [sortBy, setSortBy] = useState("createdAt"); // Sorteringsmetod
  const [notifications, setNotifications] = useState([]); // För toast-notiser
  const [showConfirmDelete, setShowConfirmDelete] = useState(null); // För bekräftelse innan radering
  const [toastMessage, setToastMessage] = useState(""); // Meddelande för toast

  const user = JSON.parse(localStorage.getItem("user")); // Hämtar användaren från localStorage
  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin"; // Endast vissa roller kan dra och släppa

  // Funktion för att hämta alla beställningar
  const fetchOrders = async () => {
    const res = await axios.get("/orders");
    const newCols = {
      toDo: { name: "Att beställa", items: [] },
      ordered: { name: "Beställd", items: [] },
      delivered: { name: "Levererad", items: [] },
      assigned: { name: "Mina uppgifter", items: [] },
    };

    // Spara beställningar i rätt kolumn
    const userId = user?._id;
    const localSeen = JSON.parse(localStorage.getItem("seenNotifs") || "[]");
    const newNotifs = [];

    res.data.forEach((order) => {
      const key = Object.keys(statusMap).find((k) => statusMap[k] === order.status);
      if (key) newCols[key].items.push(order);

      // Lägg till notis om det är min beställning
      if (order.createdBy === userId && !localSeen.includes(order._id)) {
        newNotifs.push({ id: order._id, text: `Din beställning '${order.item}' har nu statusen: '${order.status}'` });
      }
    });

    // Hämta tilldelade uppgifter för managers
    if (user?.role === "manager") {
      const assignedRes = await axios.get("/orders/my-tasks");
      newCols.assigned.items = assignedRes.data;
    }

    setColumns(newCols);
    setNotifications(newNotifs);
  };

  // Körs vid start
  useEffect(() => {
    fetchOrders();
  }, []);

  // Skapa ny beställning
  const handleAddItem = async () => {
    if (!input.trim()) return;
    await axios.post("/orders", { item: input });
    setInput("");
    fetchOrders();
  };

  // Ta bort beställning
  const handleDelete = async (id) => {
    await axios.delete(`/orders/${id}`);
    setShowConfirmDelete(null);
    fetchOrders();
  };

  // Hanterar drag and drop-funktionalitet
  const onDragEnd = async (result) => {
    if (!isManagerOrAdmin) return;

    const { source, destination } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    // Kopiera och filtrera listorna
    const sourceItems = [...columns[source.droppableId].items];
    const destItems = [...columns[destination.droppableId].items];

    const sourceFiltered = filterAndSort(sourceItems);
    const destFiltered = filterAndSort(destItems);

    const [movedItem] = sourceFiltered.splice(source.index, 1);
    destFiltered.splice(destination.index, 0, movedItem);

    // Lägg till tidsstämplar
    const timestampField =
      destination.droppableId === "ordered"
        ? "orderedAt"
        : destination.droppableId === "delivered"
        ? "deliveredAt"
        : null;

    if (timestampField) {
      movedItem[timestampField] = new Date().toISOString();
    }

    // Uppdatera UI
    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: { ...prev[source.droppableId], items: sourceFiltered },
      [destination.droppableId]: { ...prev[destination.droppableId], items: destFiltered },
    }));

    // Uppdatera i databasen
    const res = await axios.put(`/orders/${movedItem._id}`, {
      status: statusMap[destination.droppableId],
      ...(timestampField ? { [timestampField]: movedItem[timestampField] } : {}),
    });

    // Visa toast om det är min beställning
    if (res?.data?.createdBy === user?._id) {
      setToastMessage(`Din beställning "${movedItem.item}" har nu statusen: ${statusMap[destination.droppableId]}`);
    }

    fetchOrders();
  };

  // Filtrerar och sorterar beställningar i kolumnerna
  const filterAndSort = (items) => {
    let filtered = items.filter((item) =>
      item.item?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    switch (sortBy) {
      case "createdAt":
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "orderedAt":
        return filtered.sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0));
      case "deliveredAt":
        return filtered.sort((a, b) => new Date(b.deliveredAt || 0) - new Date(a.deliveredAt || 0));
      case "status":
        return filtered.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return filtered;
    }
  };

  return (
    <>
      {/* Header-komponent */}
      <Header
        notifications={notifications}
        clearNotifs={() => {
          const seen = notifications.map(n => n.id);
          localStorage.setItem("seenNotifs", JSON.stringify(seen));
          setNotifications([]);
        }}
      />

      {/* Toast för notiser */}
      {toastMessage && (
        <NotificationToast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <div className="bg-gray-900 text-white min-h-screen p-6">
        {/* Titel och inputfält */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-extrabold text-white text-center w-full md:w-auto">📋 Beställnings-Kanban</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ny beställning"
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full sm:w-auto"
            />
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition transform hover:scale-105 w-full sm:w-auto"
            >
              Lägg till
            </button>
          </div>
        </div>

        {/* Sökfält */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Sök..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black px-3 py-2 rounded border"
          />
        </div>

        {/* DragDropContext innehåller hela kanban */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(columns).map(([columnId, column]) => {
              const sortedItems = filterAndSort(column.items);
              return (
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl p-4 min-h-[400px] border border-slate-700"
                    >
                      <h2 className="text-xl font-semibold mb-4">{column.name}</h2>
                      <div className="space-y-4">
                        {sortedItems.map((item, index) => (
                          <Draggable
                            key={item._id}
                            draggableId={item._id}
                            index={index}
                            isDragDisabled={!isManagerOrAdmin}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-slate-700 p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out text-white relative border border-slate-600"
                              >
                                {/* Beställningens innehåll */}
                                <p className="font-medium">{item.item}</p>
                                <p className="text-sm text-gray-300 mt-1">
                                  {item.createdAt && `Skapad: ${dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}`}
                                </p>
                                {item.orderedAt && (
                                  <p className="text-sm text-blue-300">
                                    Beställd: {dayjs(item.orderedAt).format("YYYY-MM-DD HH:mm")}
                                  </p>
                                )}
                                {item.deliveredAt && (
                                  <p className="text-sm text-green-300">
                                    Levererad: {dayjs(item.deliveredAt).format("YYYY-MM-DD HH:mm")}
                                  </p>
                                )}
                                {item.dueDate && (
                                  <p className={`text-sm ${dayjs(item.dueDate).isBefore(dayjs(), "day") ? "text-red-400 font-semibold" : "text-red-300"}`}>
                                    ⏰ Förfallodatum: {dayjs(item.dueDate).format("YYYY-MM-DD")}
                                  </p>
                                )}
                                {item.assignedTo ? (
                                  <p className="text-xs mt-2 text-indigo-300">
                                    👤 Tilldelad till: {item.assignedTo.username}
                                  </p>
                                ) : (
                                  <p className="text-xs mt-2 text-gray-400">🚫 Ej tilldelad</p>
                                )}
                                <p className={`text-xs mt-2 inline-block px-2 py-1 rounded font-medium ${
                                  item.status === "todo" ? "bg-yellow-500 text-black"
                                    : item.status === "ordered" ? "bg-blue-500"
                                    : "bg-green-500"
                                }`}>
                                  {column.name}
                                </p>
                                {/* Knappar för redigera och radera */}
                                {isManagerOrAdmin && (
                                  <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                      onClick={() => setSelectedOrder(item)}
                                      className="text-gray-400 hover:text-white"
                                      title="Redigera"
                                    >✏️</button>
                                    <button
                                      onClick={() => setShowConfirmDelete(item._id)}
                                      className="text-red-400 hover:text-white"
                                      title="Ta bort"
                                    >🗑️</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Ordermodal för redigering */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          fetchOrders={fetchOrders}
        />
      )}

      {/* Bekräfta radering */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Bekräfta radering</h3>
            <p>Är du säker på att du vill ta bort denna beställning?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >Nej</button>
              <button
                onClick={() => handleDelete(showConfirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >Ja, ta bort</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KanbanBoard;
