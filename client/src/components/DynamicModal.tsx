import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { DateInput } from './DateInput';

export type FieldType = 'text' | 'currency' | 'select' | 'autocomplete' | 'date' | 'radio';

export interface DynamicField {
    name: string;
    label: React.ReactNode | ((data: any) => React.ReactNode);
    type: FieldType;
    colSpan?: number; // 1 to 12. Padrão: 12 (linha inteira)
    options?: any[]; // para select, autocomplete, radio
    getOptionLabel?: (option: any) => string; // para autocomplete ou labels customizadas
    getOptionValue?: (option: any) => any; // para select/radio
    required?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
    iconAction?: {
        icon: React.ReactNode;
        onClick: () => void;
        title: string;
    };
    endIcon?: React.ReactNode; // Ícone dentro do campo (MUI Adornment)
    transform?: (val: string, currentData: any) => string; // Transformação simples ao digitar
    onChangeOverride?: (val: any, currentData: any, setFormData: React.Dispatch<React.SetStateAction<any>>) => void; // Para efeitos colaterais complexos (ex: mudar moeda e recalcular saldo)
    textColorCondition?: (data: any) => string; // Alterar cor do texto dinamicamente
    radioStyle?: 'default' | 'colored'; // Estilos específicos de rádio (ex: azul/vermelho)
    errorCondition?: (data: any) => boolean;
    helperText?: string | ((data: any) => string);
}

interface DynamicModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    initialData?: any;
    data?: any; // To support migrating from initialData -> data
    onSave: (data: any) => void;
    onSaveAndContinue?: (data: any, resetForm: () => void) => void; // Para salvar sem fechar a janela
    fields: DynamicField[][]; // Array de Arrays para representar as Linhas e Colunas
    saveButtonText?: string;
    cancelButtonText?: string;
    saveButtonClassName?: string;
    saveButtonIcon?: React.ReactNode;
    cancelButtonIcon?: React.ReactNode;
    cancelButtonClassName?: string;
    isSaveDisabled?: (data: any) => boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function DynamicModal({
    isOpen,
    onClose,
    title,
    icon,
    initialData,
    data,
    onSave,
    onSaveAndContinue,
    fields,
    saveButtonText = 'Salvar',
    cancelButtonText = 'Cancelar',
    saveButtonClassName,
    saveButtonIcon,
    cancelButtonIcon,
    cancelButtonClassName,
    isSaveDisabled,
    maxWidth = '2xl'
}: DynamicModalProps) {
    const [formData, setFormData] = useState(data || initialData || {});

    // Sincronizar dados iniciais quando o modal abre
    useEffect(() => {
        if (isOpen) {
            setFormData(data || initialData || {});
        }
    }, [isOpen, initialData, data]);

    const handleResetForm = () => {
        setFormData(initialData);
    };

    if (!isOpen) return null;

    const handleChange = (name: string, value: any, field: DynamicField) => {
        // Se o campo fornecer um override, ele tem controle total sobre o que acontece no estado
        if (field.onChangeOverride) {
            field.onChangeOverride(value, formData, setFormData);
            return;
        }

        let finalValue = value;

        // Aplicar transformações simples (ex: replace de caracteres)
        if (field.transform) {
            finalValue = field.transform(value, formData);
        }

        setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    };

    const getLabel = (field: DynamicField) => {
        return typeof field.label === 'function' ? field.label(formData || {}) : field.label;
    };

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
    }[maxWidth] || 'max-w-2xl';

    const renderField = (field: DynamicField) => {
        if (!field) return null;

        const safeFormData = formData || {};
        const value = safeFormData[field.name];
        const safeValue = value !== undefined && value !== null ? value : '';
        const label = getLabel(field);
        const hasIcon = !!field.iconAction;
        const isError = field.errorCondition ? field.errorCondition(safeFormData) : false;
        const helperTextStr = typeof field.helperText === 'function' ? field.helperText(safeFormData) : field.helperText;

        let content = null;

        switch (field.type) {
            case 'text':
            case 'currency':
                content = (
                    <TextField
                        label={label as React.ReactNode}
                        variant="standard"
                        value={safeValue}
                        onChange={(e) => handleChange(field.name, e.target.value, field)}
                        fullWidth
                        placeholder={field.placeholder || ''}
                        disabled={field.disabled}
                        autoFocus={field.autoFocus}
                        error={isError}
                        helperText={isError ? helperTextStr : ''}
                        InputProps={field.endIcon ? {
                            endAdornment: (
                                <InputAdornment position="end">
                                    {field.endIcon}
                                </InputAdornment>
                            )
                        } : undefined}
                        sx={{
                            input: {
                                color: field.textColorCondition ? field.textColorCondition(formData) : 'inherit'
                            }
                        }}
                    />
                );
                break;
            case 'date':
                content = (
                    <DateInput
                        label={typeof label === 'string' ? label : undefined}
                        value={safeValue}
                        onChange={(val) => handleChange(field.name, val, field)}
                        disabled={field.disabled}
                        required={field.required}
                    />
                );
                break;
            case 'select':
                content = (
                    <FormControl variant="standard" fullWidth disabled={field.disabled}>
                        <InputLabel>{label as React.ReactNode}</InputLabel>
                        <Select
                            value={safeValue}
                            label={typeof label === 'string' ? label : undefined}
                            onChange={(e) => handleChange(field.name, e.target.value, field)}
                        >
                            {field.options?.map((opt, i) => {
                                const optValue = field.getOptionValue ? field.getOptionValue(opt) : opt.value;
                                const optLabel = field.getOptionLabel ? field.getOptionLabel(opt) : opt.label;
                                return (
                                    <MenuItem key={i} value={optValue}>{optLabel}</MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                );
                break;
            case 'autocomplete':
                const selectedOption = (field.options || []).find(opt => {
                    const optVal = field.getOptionValue ? field.getOptionValue(opt) : opt.code;
                    return optVal === safeValue;
                }) || null;

                content = (
                    <Autocomplete
                        options={field.options || []}
                        getOptionLabel={(opt) => field.getOptionLabel ? field.getOptionLabel(opt) : String(opt)}
                        value={selectedOption}
                        onChange={(_, newValue) => {
                            const newOptVal = newValue ? (field.getOptionValue ? field.getOptionValue(newValue) : newValue.code) : '';
                            handleChange(field.name, newOptVal, field);
                        }}
                        disabled={field.disabled}
                        slotProps={{
                            paper: {
                                sx: { width: 'max-content', minWidth: '100%' }
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label as React.ReactNode}
                                variant="standard"
                                fullWidth
                            />
                        )}
                        noOptionsText="Nenhum banco encontrado"
                    />
                );
                break;
            case 'radio':
                content = (
                    <div className="flex items-center gap-6 justify-center h-full pb-2">
                        {field.options?.map((opt, i) => {
                            const optValue = field.getOptionValue ? field.getOptionValue(opt) : opt.value;
                            const optLabel = field.getOptionLabel ? field.getOptionLabel(opt) : opt.label;
                            const optColor = field.radioStyle === 'colored'
                                ? (optValue === 'credor' ? 'text-blue-500 accent-blue-500' : 'text-red-500 accent-red-500')
                                : 'text-blue-500 accent-blue-500';

                            return (
                                <label key={i} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field.name}
                                        value={optValue}
                                        checked={safeValue === optValue}
                                        onChange={(e) => handleChange(field.name, e.target.value, field)}
                                        className={`w-4 h-4 ${optColor}`}
                                    />
                                    <span className="text-sm text-gray-700">{optLabel}</span>
                                </label>
                            );
                        })}
                    </div>
                );
                break;
        }

        const colSpanClass = {
            1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
            5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
            9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
        }[field.colSpan || 12] || 'col-span-12';

        if (hasIcon) {
            return (
                <div className={`${colSpanClass} grid grid-cols-4 gap-2`}>
                    <div className="col-span-3">
                        {content}
                    </div>
                    <div className="col-span-1 flex items-end justify-center">
                        <div
                            onClick={field.iconAction?.onClick}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer pb-2"
                            title={field.iconAction?.title}
                        >
                            {field.iconAction?.icon}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`${colSpanClass}`}>
                {content}
            </div>
        );
    };

    const isDisabled = isSaveDisabled ? isSaveDisabled(formData) : false;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-100 rounded-lg w-full ${maxWidthClass} mx-4`}>
                <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {icon && <div>{icon}</div>}
                        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 relative">
                    {fields.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-12 gap-6 items-end mb-6">
                            {row.map((field, fieldIndex) => (
                                <React.Fragment key={fieldIndex}>
                                    {renderField(field)}
                                </React.Fragment>
                            ))}
                        </div>
                    ))}

                    {/* Botões de Ação no Rodapé */}
                    <div className="flex justify-end items-center gap-4 pt-4 mt-8 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                if (onSaveAndContinue) {
                                    onSaveAndContinue(formData, handleResetForm);
                                } else {
                                    onSave(formData);
                                }
                            }}
                            disabled={isDisabled}
                            title={saveButtonText}
                            className={`flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${saveButtonClassName || 'w-12 h-12 bg-[#2D82CD] hover:bg-[#1E6CAE] rounded-xl text-white shadow-sm'}`}
                        >
                            {saveButtonIcon || <span className="text-sm px-4">{saveButtonText}</span>}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            title={cancelButtonText}
                            className={`flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 ${cancelButtonClassName || 'bg-[#DC3545] hover:bg-[#C82333] text-white rounded-md px-4 py-2 text-sm font-medium shadow-sm'}`}
                        >
                            {cancelButtonIcon}
                            {(cancelButtonText && !cancelButtonIcon) ? (
                                <span className="px-4 text-sm">{cancelButtonText}</span>
                            ) : (
                                cancelButtonText ? <span className="ml-1 pr-1">{cancelButtonText}</span> : null
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
