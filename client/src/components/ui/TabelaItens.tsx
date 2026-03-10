
import React, { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Column {
    label: string;
    key: string;
    align?: "left" | "center" | "right";
    width?: string;
    sortable?: boolean;
    render?: (item: any) => React.ReactNode;
}

interface Action {
    icon: any;
    color: string;
    title: string;
    onClick: (item: any) => void;
}

interface TabelaItensProps {
    data: any[];
    columns: Column[];
    actions?: Action[] | ((item: any) => React.ReactNode);
    emptyMessage?: string;
    emptyIcon?: any;
    initialPerPage?: number;
    selectable?: boolean;
    selectedItems?: any[];
    onSelectionChange?: (selectedItems: any[]) => void;
}

export function TabelaItens({
    data = [],
    columns = [],
    actions = [],
    emptyMessage = "Nenhum item encontrado.",
    emptyIcon: EmptyIcon,
    initialPerPage = 5,
    selectable = false,
    selectedItems = [],
    onSelectionChange = () => {}
}: TabelaItensProps) {
    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(initialPerPage);

    // Estados de ordenação
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Função para ordenação
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Lógica de ordenação de dados
    const sortedData = [...data].sort((a, b) => {
        if (!sortField) return 0;

        let aValue = a[sortField];
        let bValue = b[sortField];

        if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Lógica de paginação
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Range de itens exibidos
    const rangeStart = totalItems === 0 ? 0 : startIndex + 1;
    const rangeEnd = Math.min(endIndex, totalItems);

    // Funções de seleção
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(paginatedData);
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectItem = (item: any, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedItems, item]);
        } else {
            onSelectionChange(selectedItems.filter(i => i.id !== item.id));
        }
    };

    const isSelected = (item: any) => selectedItems.some(i => i.id === item.id);
    const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => isSelected(item));

    if (totalItems === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg m-4">
                {EmptyIcon && <EmptyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
                <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 1. Card de Cabeçalho Fixo */}
            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <colgroup>
                                {selectable && <col style={{ width: '50px' }} />}
                                {columns.map((col, idx) => (
                                    <col key={idx} style={{ width: col.width || 'auto' }} />
                                ))}
                                {actions && <col style={{ width: '180px' }} />}
                            </colgroup>
                            <thead className="bg-gray-50">
                                <tr>
                                    {selectable && (
                                        <th className="px-3 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </th>
                                    )}
                                    {columns.map((col, idx) => (
                                        <th
                                            key={idx}
                                            className={`px-3 py-3 text-${col.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-gray-700 transition-colors' : ''}`}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                        >
                                            <div className={`flex items-center justify-${col.align === 'center' ? 'center' : col.align === 'right' ? 'end' : 'start'} space-x-1`}>
                                                <span>{col.label}</span>
                                                {col.sortable && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                    ))}
                                    {actions && (
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    )}
                                </tr>
                            </thead>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Card dos Dados com Scroll */}
            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                        <table className="w-full table-fixed">
                            <colgroup>
                                {selectable && <col style={{ width: '50px' }} />}
                                {columns.map((col, idx) => (
                                    <col key={idx} style={{ width: col.width || 'auto' }} />
                                ))}
                                {actions && <col style={{ width: '180px' }} />}
                            </colgroup>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedData.map((item, rowIdx) => (
                                    <tr key={item.id || rowIdx} className="hover:bg-gray-50 transition-colors duration-150">
                                        {selectable && (
                                            <td className="px-3 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected(item)}
                                                    onChange={(e) => handleSelectItem(item, e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-3 py-3 text-${col.align || 'left'} text-xs text-gray-900 truncate`}>
                                                {col.render ? col.render(item) : (item[col.key] || '-')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-2 py-2 text-center">
                                                <div className="flex items-center justify-center space-x-0">
                                                    {typeof actions === 'function' ? (
                                                        actions(item)
                                                    ) : (
                                                        actions.map((action, actionIdx) => (
                                                            <button
                                                                key={actionIdx}
                                                                className={`${action.color} hover:opacity-80 transition-colors p-2 rounded-full hover:bg-gray-100`}
                                                                title={action.title}
                                                                onClick={() => action.onClick(item)}
                                                            >
                                                                <action.icon className="h-3.5 w-3.5" />
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Card de Paginação Separado */}
            <Card className="shadow-lg">
                <CardContent className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">
                                Mostrando {rangeStart} a {rangeEnd} de {totalItems} resultados
                            </span>
                            <span className="text-sm text-gray-500">|</span>
                            <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="5">5 por página</option>
                                <option value="10">10 por página</option>
                                <option value="20">20 por página</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className={`px-3 py-1 text-sm transition-colors ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </button>

                            {/* Renderizar páginas dinamicamente */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${page === currentPage
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className={`px-3 py-1 text-sm transition-colors ${currentPage === totalPages || totalPages === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
