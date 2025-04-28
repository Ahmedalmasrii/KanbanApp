import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Header from "./Header";
import OrderModal from "./OrderModal";
import dayjs from "dayjs";

const statusMap = {
  toDo: "todo",
  ordered: "ordered",
  delivered: "delivered",
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    toDo: { name: "Att beställa", items: [] },
    ordered: { name: "Beställd", items: [] },
    delivered: { name: "Levererad", items: [] },
    assigned: { name: "Mina uppgifter", items: [] },
  });

  const [input, setInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const user = JSON.parse(localStorage.getItem("user"));
  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin";

  const fetchOrders = async () => {
    const res = await axios.get("/orders");
    const newCols = {
      toDo: { name: "Att beställa", items: [] },
      ordered: { name: "Beställd", items: [] },
      delivered: { name: "Levererad", items: [] },
      assigned: { name: "Mina uppgifter", items: [] },
    };

    res.data.forEach((order) => {
      const key = Object.keys(statusMap).find(
        (k) => statusMap[k] === order.status
      );
      if (key) newCols[key].items.push(order);
    });

    if (user?.role === "manager") {
      const assignedRes = await axios.get("/orders/my-tasks");
      newCols.assigned.items = assignedRes.data;
    }

    setColumns(newCols);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddItem = async () => {
    if (!input.trim()) return;
    const res = await axios.post("/orders", { item: input });
    setColumns((prev) => ({
      ...prev,
      toDo: {
        ...prev.toDo,
        items: [
          ...prev.toDo.items,
          {
            id: res.data._id,
            item: res.data.item,
            status: "todo",
            createdAt: res.data.createdAt,
          },
        ],
      },
    }));
    setInput("");
  };

  const onDragEnd = async (result) => {
    if (!isManagerOrAdmin) return;
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const [movedItem] = sourceCol.items.splice(source.index, 1);
    destCol.items.splice(destination.index, 0, movedItem);

    const timestampField =
      destination.droppableId === "ordered"
        ? "orderedAt"
        : destination.droppableId === "delivered"
        ? "deliveredAt"
        : null;

    if (timestampField) {
      movedItem[timestampField] = new Date().toISOString();
    }

    const newCols = {
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    };

    setColumns(newCols);

    await axios.put(`/orders/${movedItem._id}`, {
      status: statusMap[destination.droppableId],
      ...(timestampField
        ? { [timestampField]: movedItem[timestampField] }
        : {}),
    });
  };

  const filterAndSort = (items) => {
    let filtered = items.filter((item) =>
      item.item?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    switch (sortBy) {
      case "createdAt":
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "orderedAt":
        return filtered.sort(
          (a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0)
        );
      case "deliveredAt":
        return filtered.sort(
          (a, b) => new Date(b.deliveredAt || 0) - new Date(a.deliveredAt || 0)
        );
      case "status":
        return filtered.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return filtered;
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-900 text-white min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📦 Beställnings-Kanban</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ny beställning"
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
            />
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Lägg till
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Sök..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black px-3 py-2 rounded border"
          />
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
  <div className="grid md:grid-cols-4 gap-6">
    {Object.entries(columns).map(([columnId, column]) => {
      const isToDo = columnId === "toDo";
      const isAssigned = columnId === "assigned";
      const bgColor =
        isToDo && column.items.length > 5
          ? "bg-red-800"
          : isToDo
          ? "bg-green-800"
          : isAssigned
          ? "bg-indigo-800"
          : "bg-gray-800";

      return (
        <Droppable key={columnId} droppableId={columnId}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`${bgColor} rounded-lg shadow p-4 min-h-[300px]`}
            >
              <h2 className="text-xl font-semibold mb-4">
                {column.name}
              </h2>
              <div className="space-y-4">
                {filterAndSort(column.items).map((item, index) => (
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
                        {...(isManagerOrAdmin && provided.dragHandleProps)}
                        className="bg-gray-700 p-4 rounded-lg shadow text-white relative"
                      >
                        <p className="font-medium">{item.item}</p>

                        {/* Visar skapad tid */}
                        <p className="text-sm text-gray-300 mt-1">
                          {item.createdAt && `Skapad: ${dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}`}
                        </p>

                        {/* Visar beställd tid om finns */}
                        {item.orderedAt && (
                          <p className="text-sm text-blue-300">
                            Beställd: {dayjs(item.orderedAt).format("YYYY-MM-DD HH:mm")}
                          </p>
                        )}

                        {/* Visar levererad tid om finns */}
                        {item.deliveredAt && (
                          <p className="text-sm text-green-300">
                            Levererad: {dayjs(item.deliveredAt).format("YYYY-MM-DD HH:mm")}
                          </p>
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

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          fetchOrders={fetchOrders}
        />
      )}
    </>
  );
};

export default KanbanBoard;
