import React, { useState, useEffect } from 'react';
import { X, Save, LogOut } from 'lucide-react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { DateInput } from './DateInput';
import { IButtonPrime } from './ui/i-ButtonPrime';

export type FieldType = 'text' | 'currency' | 'select' | 'autocomplete' | 'date' | 'radio';

export interface DynamicField {
    name: string;
    label: React.ReactNode | ((data: any) => React.ReactNode);
    type: FieldType;
    colSpan?: number; // 1 to 12. Padrão: 12 (linha inteira)
    options?: any[] | ((data: any) => any[]); // para select, autocomplete, radio
    getOptionLabel?: (option: any) => string; // para autocomplete ou labels customizadas
    getOptionValue?: (option: any) => any; // para select/radio
    required?: boolean;
    disabled?: boolean | ((data: any) => boolean);
    autoFocus?: boolean;
    placeholder?: string;
    iconAction?: {
        icon: React.ReactNode;
        onClick: () => void;
        title: string;
    };
    endIcon?: React.ReactNode; // Ícone dentro do campo (MUI Adornment)
    transform?: (val: string, currentData: any) => string; // Transformação simples ao digitar
    onChangeOverride?: (val: any, currentData: any, setFormData: React.Dispatch<React.SetStateAction<any>>) => void; // Para efeitos colaterais complexos
    textColorCondition?: (data: any) => string; // Alterar cor do texto dinamicamente
    radioStyle?: 'default' | 'colored'; // Estilos específicos de rádio
    errorCondition?: (data: any) => boolean;
    helperText?: string | ((data: any) => string);
    hidden?: (data: any) => boolean; // Ocultar campos dinamicamente
}

interface DynamicModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    initialData?: any;
    data?: any;
    onSave: (data: any) => void;
    onSaveAndContinue?: (data: any, resetForm: () => void) => void;
    fields: DynamicField[][];
    saveButtonText?: string;
    cancelButtonText?: string;
    saveButtonClassName?: string;
    saveButtonIcon?: React.ReactNode;
    cancelButtonIcon?: React.ReactNode;
    cancelButtonClassName?: string;
    isSaveDisabled?: (data: any) => boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    hideCloseButton?: boolean;
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
    cancelButtonText = 'Sair',
    saveButtonClassName,
    saveButtonIcon,
    cancelButtonIcon,
    cancelButtonClassName,
    isSaveDisabled,
    maxWidth = '2xl',
    hideCloseButton = false
}: DynamicModalProps) {
    const [formData, setFormData] = useState(data || initialData || {});

    useEffect(() => {
        if (isOpen) {
            setFormData(data || initialData || {});
        }
    }, [isOpen, initialData, data]);

    const handleResetForm = () => {
        setFormData(initialData || {});
    };

    if (!isOpen) return null;

    const handleChange = (name: string, value: any, field: DynamicField) => {
        if (field.onChangeOverride) {
            field.onChangeOverride(value, formData, setFormData);
            return;
        }

        let finalValue = value;
        if (field.transform) {
            finalValue = field.transform(value, formData);
        }

        setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    };

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
    }[maxWidth] || 'max-w-2xl';

    const renderFieldContent = (field: DynamicField) => {
        const isFieldDisabled = typeof field.disabled === 'function' ? field.disabled(formData) : !!field.disabled;
        const currentOptions = typeof field.options === 'function' ? field.options(formData) : (field.options || []);
        const label = typeof field.label === 'function' ? field.label(formData) : field.label;
        const helperText = typeof field.helperText === 'function' ? field.helperText(formData) : field.helperText;

        const commonStyles = {
            '& .MuiInputLabel-root': { color: '#1D3557' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#B59363' },
            '& .MuiInput-underline:after': { borderBottomColor: '#B59363' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#1D3557' },
            '& .MuiInputBase-input': {
                color: field.textColorCondition ? field.textColorCondition(formData) : '#1D3557',
                fontWeight: 500
            }
        };

        switch (field.type) {
            case 'text':
            case 'currency':
                return (
                    <TextField
                        fullWidth
                        label={label}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value, field)}
                        disabled={isFieldDisabled}
                        variant="standard"
                        placeholder={field.placeholder}
                        autoFocus={field.autoFocus}
                        sx={commonStyles}
                        InputLabelProps={{ shrink: true }}
                        helperText={helperText}
                        InputProps={{
                            endAdornment: field.endIcon ? (
                                <InputAdornment position="end">{field.endIcon}</InputAdornment>
                            ) : field.iconAction ? (
                                <InputAdornment position="end">
                                    <button
                                        type="button"
                                        onClick={field.iconAction.onClick}
                                        title={field.iconAction.title}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        {field.iconAction.icon}
                                    </button>
                                </InputAdornment>
                            ) : null
                        }}
                    />
                );
            case 'date':
                return (
                    <DateInput
                        label={typeof label === 'string' ? label : undefined}
                        value={formData[field.name] || ''}
                        onChange={(val) => handleChange(field.name, val, field)}
                        disabled={isFieldDisabled}
                        required={field.required}
                    />
                );
            case 'select':
                return (
                    <FormControl variant="standard" fullWidth sx={commonStyles} disabled={isFieldDisabled}>
                        <InputLabel shrink={true}>{label}</InputLabel>
                        <Select
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value, field)}
                            displayEmpty
                        >
                            {currentOptions.map((opt: any, i: number) => (
                                <MenuItem
                                    key={i}
                                    value={field.getOptionValue ? field.getOptionValue(opt) : opt.value}
                                >
                                    {field.getOptionLabel ? field.getOptionLabel(opt) : opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {helperText && (
                            <div className="text-[10px] mt-1 text-gray-400">{helperText}</div>
                        )}
                        {field.iconAction && (
                            <div className="absolute right-0 top-0 mt-[-20px]">
                                <button
                                    type="button"
                                    onClick={field.iconAction.onClick}
                                    title={field.iconAction.title}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    {field.iconAction.icon}
                                </button>
                            </div>
                        )}
                    </FormControl>
                );
            case 'autocomplete':
                return (
                    <Autocomplete
                        options={currentOptions}
                        disabled={isFieldDisabled}
                        getOptionLabel={field.getOptionLabel || ((opt: any) => opt.label || '')}
                        value={currentOptions.find((opt: any) => (field.getOptionValue ? field.getOptionValue(opt) : opt.value) === formData[field.name]) || null}
                        onChange={(_, newValue) => {
                            const val = newValue ? (field.getOptionValue ? field.getOptionValue(newValue) : newValue.value) : '';
                            handleChange(field.name, val, field);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label={label}
                                placeholder={field.placeholder}
                                sx={commonStyles}
                                InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {field.iconAction && (
                                                <InputAdornment position="end">
                                                    <button
                                                        type="button"
                                                        onClick={field.iconAction.onClick}
                                                        title={field.iconAction.title}
                                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
                                                    >
                                                        {field.iconAction.icon}
                                                    </button>
                                                </InputAdornment>
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                    />
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">{label}</label>
                        <div className="flex flex-wrap gap-4">
                            {currentOptions.map((opt: any, i: number) => {
                                const val = field.getOptionValue ? field.getOptionValue(opt) : opt.value;
                                const isSelected = formData[field.name] === val;
                                return (
                                    <label key={i} className={`flex items-center gap-2 cursor-pointer ${isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <input
                                            type="radio"
                                            name={field.name}
                                            value={val}
                                            checked={isSelected}
                                            disabled={isFieldDisabled}
                                            onChange={() => handleChange(field.name, val, field)}
                                            className="w-4 h-4 accent-[#B59363]"
                                        />
                                        <span className={`text-sm ${isSelected ? 'font-medium text-[#1D3557]' : 'text-gray-600'}`}>
                                            {field.getOptionLabel ? field.getOptionLabel(opt) : opt.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderField = (field: DynamicField) => {
        if (!field || (field.hidden && field.hidden(formData))) return null;

        const colSpanClass = {
            1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
            5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
            9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
        }[field.colSpan || 12] || 'col-span-12';

        return (
            <div key={field.name} className={colSpanClass}>
                {renderFieldContent(field)}
            </div>
        );
    };

    const isDisabled = isSaveDisabled ? isSaveDisabled(formData) : false;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-100 rounded-lg w-full ${maxWidthClass} mx-4 overflow-hidden`}>
                <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        {icon && <div>{icon}</div>}
                        <h2 className="text-xl font-bold text-[#1D3557]">
                            {title}
                        </h2>
                    </div>
                    {!hideCloseButton && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    )}
                </div>
                <div className="p-6 relative max-h-[85vh] overflow-y-auto">
                    {fields.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-12 gap-6 items-end mb-6">
                            {row.map((field) => renderField(field))}
                        </div>
                    ))}

                    <div className="flex justify-end items-center gap-4 pt-4 mt-8 border-t border-gray-100">
                        {onSaveAndContinue ? (
                            <IButtonPrime
                                icon={saveButtonIcon || <Save className="h-5 w-5" />}
                                onClick={() => onSaveAndContinue(formData, handleResetForm)}
                                disabled={isDisabled}
                                title={saveButtonText}
                                className={saveButtonClassName}
                            />
                        ) : (
                            <IButtonPrime
                                icon={saveButtonIcon || <Save className="h-5 w-5" />}
                                onClick={() => onSave(formData)}
                                disabled={isDisabled}
                                title={saveButtonText}
                                className={saveButtonClassName}
                            />
                        )}

                        <IButtonPrime
                            icon={cancelButtonIcon || <LogOut className="h-5 w-5" />}
                            onClick={onClose}
                            variant="red"
                            title={cancelButtonText}
                            className={cancelButtonClassName}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
