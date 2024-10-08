
  declare const $NestedValue: unique symbol;

  
// const INPUT_VALIDATION_RULES = {
//     max: 'max',
//     min: 'min',
//     maxLength: 'maxLength',
//     minLength: 'minLength',
//     pattern: 'pattern',
//     required: 'required',
//     validate: 'validate',
// } as const;
  
  declare module '.react-hook-form' {
    type Noop = () => void;

    type ArrayKey = number;

    type BrowserNativeObject = Date | FileList | File;

    type IsAny<T> = 0 extends 1 & T ? true : false;

    type EventType =
        | 'focus'
        | 'blur'
        | 'change'
        | 'changeText'
        | 'valueChange'
        | 'contentSizeChange'
        | 'endEditing'
        | 'keyPress'
        | 'submitEditing'
        | 'layout'
        | 'selectionChange'
        | 'longPress'
        | 'press'
        | 'pressIn'
        | 'pressOut'
        | 'momentumScrollBegin'
        | 'momentumScrollEnd'
        | 'scroll'
        | 'scrollBeginDrag'
        | 'scrollEndDrag'
        | 'load'
        | 'error'
        | 'progress'
        | 'custom';

    type FieldValues = Record<string, any>;

    type Message = string;

    type ValidateResult = Message | Message[] | boolean | undefined;

    type IsEqual<T1, T2> = T1 extends T2
        ? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
            ? true
            : false
        : false;

    type NestedValue<TValue extends object = object> = {
        [$NestedValue]: never;
    } & TValue;

    type MultipleFieldErrors = {
        [key: string]: ValidateResult;
    };

    type Primitive =
        | null
        | undefined
        | string
        | number
        | boolean
        | symbol
        | bigint;


    type EmptyObject = { [K in string | number]: never };

    type NonUndefined<T> = T extends undefined ? never : T;

    type ExtractObjects<T> = T extends infer U
    ? U extends object
        ? U
        : never
    : never;

    type LiteralUnion<T extends U, U extends Primitive> =
    | T
    | (U & { _?: never });

    type DeepPartial<T> = T extends BrowserNativeObject | NestedValue
    ? T
    : {
        [K in keyof T]?: ExtractObjects<T[K]> extends never
            ? T[K]
            : DeepPartial<T[K]>;
        };
    
    type TupleKeys<T extends ReadonlyArray<any>> = Exclude<
        keyof T,
        keyof any[]
    >;
    
    type AnyIsEqual<T1, T2> = T1 extends T2
        ? IsEqual<T1, T2> extends true
            ? true
            : never
        : never;

    type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
        ? false
        : true;
    
        type ArrayPathImpl<K extends string | number, V, TraversedTypes> = V extends
        | Primitive
        | BrowserNativeObject
        ? IsAny<V> extends true
          ? string
          : never
        : V extends ReadonlyArray<infer U>
          ? U extends Primitive | BrowserNativeObject
            ? IsAny<V> extends true
              ? string
              : never
            : // Check so that we don't recurse into the same type
              // by ensuring that the types are mutually assignable
              // mutually required to avoid false positives of subtypes
              true extends AnyIsEqual<TraversedTypes, V>
              ? never
              : `${K}` | `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`
          : true extends AnyIsEqual<TraversedTypes, V>
            ? never
            : `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`;
        
    type ArrayPathInternal<T, TraversedTypes = T> =
        T extends ReadonlyArray<infer V>
          ? IsTuple<T> extends true
            ? {
                [K in TupleKeys<T>]-?: ArrayPathImpl<
                  K & string,
                  T[K],
                  TraversedTypes
                >;
              }[TupleKeys<T>]
            : ArrayPathImpl<ArrayKey, V, TraversedTypes>
          : {
              [K in keyof T]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
            }[keyof T];
      
    type ArrayPath<T> = T extends any ? ArrayPathInternal<T> : never;

    type InternalFieldName = string;

    type CustomElement<TFieldValues extends FieldValues> =
    Partial<HTMLElement> & {
        name: FieldName<TFieldValues>;
        type?: string;
        value?: any;
        disabled?: boolean;
        checked?: boolean;
        options?: HTMLOptionsCollection;
        files?: FileList | null;
        focus?: Noop;
    };

    type FieldValue<TFieldValues extends FieldValues> =
        TFieldValues[InternalFieldName];

    type PathValue<T, P extends Path<T> | ArrayPath<T>> = T extends any
        ? P extends `${infer K}.${infer R}`
            ? K extends keyof T
            ? R extends Path<T[K]>
                ? PathValue<T[K], R>
                : never
            : K extends `${ArrayKey}`
                ? T extends ReadonlyArray<infer V>
                ? PathValue<V, R & Path<V>>
                : never
                : never
            : P extends keyof T
            ? T[P]
            : P extends `${ArrayKey}`
                ? T extends ReadonlyArray<infer V>
                ? V
                : never
                : never
        : never;

    type FieldPathValue<
        TFieldValues extends FieldValues,
        TFieldPath extends FieldPath<TFieldValues>,
      > = PathValue<TFieldValues, TFieldPath>;

    type IsFlatObject<T extends object> =
    Extract<
        Exclude<T[keyof T], NestedValue | Date | FileList>,
        any[] | object
    > extends never
        ? true
        : false;
    
    type ValidationValue = boolean | number | string | RegExp;

    type ValidationRule<
        TValidationValue extends ValidationValue = ValidationValue,
    > = TValidationValue | ValidationValueMessage<TValidationValue>;
    
    type ValidationValueMessage<
        TValidationValue extends ValidationValue = ValidationValue,
    > = {
        value: TValidationValue;
        message: Message;
    };
    
    type Validate<TFieldValue, TFormValues> = (
        value: TFieldValue,
        formValues: TFormValues,
    ) => ValidateResult | Promise<ValidateResult>;
    
    type RegisterOptions<
        TFieldValues extends FieldValues = FieldValues,
        TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    > = Partial<{
        required: Message | ValidationRule<boolean>;
        min: ValidationRule<number | string>;
        max: ValidationRule<number | string>;
        maxLength: ValidationRule<number>;
        minLength: ValidationRule<number>;
        validate:
        | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
        | Record<
            string,
            Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
            >;
        value: FieldPathValue<TFieldValues, TFieldName>;
        setValueAs: (value: any) => any;
        shouldUnregister?: boolean;
        onChange?: (event: any) => void;
        onBlur?: (event: any) => void;
        disabled: boolean;
        deps: FieldPath<TFieldValues> | FieldPath<TFieldValues>[];
    }> &
        (
        | {
            pattern?: ValidationRule<RegExp>;
            valueAsNumber?: false;
            valueAsDate?: false;
            }
        | {
            pattern?: undefined;
            valueAsNumber?: false;
            valueAsDate?: true;
            }
        | {
            pattern?: undefined;
            valueAsNumber?: true;
            valueAsDate?: false;
            }
        );

    type DeepMap<T, TValue> =
        IsAny<T> extends true
        ? any
        : T extends BrowserNativeObject | NestedValue
            ? TValue
            : T extends object
            ? { [K in keyof T]: DeepMap<NonUndefined<T[K]>, TValue> }
            : TValue;

    type ErrorOption = {
        message?: Message;
        type?: LiteralUnion<keyof RegisterOptions, string>;
        types?: MultipleFieldErrors;
    };
        
    type DeepRequired<T> = T extends BrowserNativeObject | Blob
        ? T
        : {
            [K in keyof T]-?: NonNullable<DeepRequired<T[K]>>;
            };

    type FieldName<TFieldValues extends FieldValues> =
        IsFlatObject<TFieldValues> extends true
            ? Extract<keyof TFieldValues, string>
            : string;


    //type DeepMap<T, V> = T extends undefined ? undefined : T extends object ? { [K in keyof T]: DeepMap<T[K], V> } : V;  

    type FieldElement<TFieldValues extends FieldValues = FieldValues> =
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | CustomElement<TFieldValues>;

    type Ref = FieldElement;

    type FieldError = {
        type: string;
        ref?: Ref;
        types?: MultipleFieldErrors;
        message?: Message;
    };

    type FieldErrors<
        TFieldValues extends FieldValues = FieldValues
    > = DeepMap<TFieldValues, FieldError>;

    type ResetAction<TFieldValues> = (formValues: TFieldValues) => TFieldValues;

    type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
        DeepPartial<TFieldValues>,
        boolean
    >;

    type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
        isDirty: boolean;
        isValidating: boolean;
        dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
        touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
        validatingFields: FieldNamesMarkedBoolean<TFieldValues>;
        errors: boolean;
        isValid: boolean;
    };

    type ReadFormState = { [K in keyof FormStateProxy]: boolean | 'all' };

export type FormState<TFieldValues extends FieldValues> = {
    isDirty: boolean;
    isLoading: boolean;
    isSubmitted: boolean;
    isSubmitSuccessful: boolean;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    disabled: boolean;
    submitCount: number;
    defaultValues?: undefined | Readonly<DeepPartial<TFieldValues>>;
    dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    touchedFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    validatingFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    errors: FieldErrors<TFieldValues>;
};

export type KeepStateOptions = Partial<{
  keepDirtyValues: boolean;
  keepErrors: boolean;
  keepDirty: boolean;
  keepValues: boolean;
  keepDefaultValues: boolean;
  keepIsSubmitted: boolean;
  keepIsSubmitSuccessful: boolean;
  keepTouched: boolean;
  keepIsValidating: boolean;
  keepIsValid: boolean;
  keepSubmitCount: boolean;
}>;

export type SetFieldValue<TFieldValues extends FieldValues> =
  FieldValue<TFieldValues>;

export type RefCallBack = (instance: any) => void;

export type SubmitHandler<TFieldValues extends FieldValues> = (
    data: TFieldValues,
    event?: React.BaseSyntheticEvent,
  ) => unknown | Promise<unknown>;
  
  export type FormSubmitHandler<TFieldValues extends FieldValues> = (payload: {
    data: TFieldValues;
    event?: React.BaseSyntheticEvent;
    formData: FormData;
    formDataJson: string;
    method?: 'post' | 'put' | 'delete';
  }) => unknown | Promise<unknown>;
  
  export type SubmitErrorHandler<TFieldValues extends FieldValues> = (
    errors: FieldErrors<TFieldValues>,
    event?: React.BaseSyntheticEvent,
  ) => unknown | Promise<unknown>;
  
  export type SetValueConfig = Partial<{
    shouldValidate: boolean;
    shouldDirty: boolean;
    shouldTouch: boolean;
  }>;
  
  export type TriggerConfig = Partial<{
    shouldFocus: boolean;
  }>;
  
  export type ChangeHandler = (event: {
    target: any;
    type?: any;
  }) => Promise<void | boolean>;

export type UseFormRegisterReturn<
  TFieldName extends InternalFieldName = InternalFieldName,
> = {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  ref: RefCallBack;
  name: TFieldName;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  disabled?: boolean;
};

export type PathImpl<K extends string | number, V, TraversedTypes> = V extends
  | Primitive
  | BrowserNativeObject
  ? `${K}`
  :
    true extends AnyIsEqual<TraversedTypes, V>
    ? `${K}`
    : `${K}` | `${K}.${PathInternal<V, TraversedTypes | V>}`;

export type PathInternal<T, TraversedTypes = T> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>;
        }[TupleKeys<T>]
      : PathImpl<ArrayKey, V, TraversedTypes>
    : {
        [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes>;
      }[keyof T];


export type Path<T> = T extends any ? PathInternal<T> : never;

export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[],
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TPath[K] & FieldPath<TFieldValues>
  >;
};

export type Subscription = {
    unsubscribe: Noop;
};
  
export type UseFormSetValue<TFieldValues extends FieldValues> = <
        TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    >(
    name: TFieldName,
    value: FieldPathValue<TFieldValues, TFieldName>,
    options?: SetValueConfig,
) => void;

export type UseFormRegister<TFieldValues extends FieldValues> = <
        TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    >(
    name: TFieldName,
    options?: RegisterOptions<TFieldValues, TFieldName>,
) => UseFormRegisterReturn<TFieldName>;

export type SetFocusOptions = Partial<{
    shouldSelect: boolean;
}>;

export type UseFormSetFocus<TFieldValues extends FieldValues> = <
        TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    >(
    name: TFieldName,
    options?: SetFocusOptions,
) => void;

export type UseFormTrigger<TFieldValues extends FieldValues> = (
    name?:
        | FieldPath<TFieldValues>
        | FieldPath<TFieldValues>[]
        | readonly FieldPath<TFieldValues>[],
    options?: TriggerConfig,
) => Promise<boolean>;

export type UseFormClearErrors<TFieldValues extends FieldValues> = (
    name?:
        | FieldPath<TFieldValues>
        | FieldPath<TFieldValues>[]
        | readonly FieldPath<TFieldValues>[]
        | `root.${string}`
        | 'root',
) => void;

export type UseFormSetError<TFieldValues extends FieldValues> = (
    name: FieldPath<TFieldValues> | `root.${string}` | 'root',
    error: ErrorOption,
    options?: {
        shouldFocus: boolean;
    },
) => void;
    
export type UseFormUnregister<TFieldValues extends FieldValues> = (
    name?:
        | FieldPath<TFieldValues>
        | FieldPath<TFieldValues>[]
        | readonly FieldPath<TFieldValues>[],
    options?: Omit<
        KeepStateOptions,
        | 'keepIsSubmitted'
        | 'keepSubmitCount'
        | 'keepValues'
        | 'keepDefaultValues'
        | 'keepErrors'
    > & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean },
) => void;

type AsyncDefaultValues<TFieldValues> = (
    payload?: unknown,
) => Promise<TFieldValues>;

type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;  

export type DefaultValues<TFieldValues> =
    TFieldValues extends AsyncDefaultValues<TFieldValues>
        ? DeepPartial<Awaited<TFieldValues>>
        : DeepPartial<TFieldValues>;

export type UseFormHandleSubmit<
    TFieldValues extends FieldValues,
    TTransformedValues extends FieldValues | undefined = undefined,
    > = (
    onValid: TTransformedValues extends undefined
        ? SubmitHandler<TFieldValues>
        : TTransformedValues extends FieldValues
        ? SubmitHandler<TTransformedValues>
        : never,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    
export type UseFormReset<TFieldValues extends FieldValues> = (
    values?:
        | DefaultValues<TFieldValues>
        | TFieldValues
        | ResetAction<TFieldValues>,
    keepStateOptions?: KeepStateOptions,
) => void;

export type UseFormGetFieldState<TFieldValues extends FieldValues> = <
    TFieldName extends FieldPath<TFieldValues>,
    >(
    name: TFieldName,
        formState?: FormState<TFieldValues>,
    ) => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: FieldError;
};

export type WatchObserver<TFieldValues extends FieldValues> = (
    value: DeepPartial<TFieldValues>,
    info: {
      name?: FieldPath<TFieldValues>;
      type?: EventType;
      values?: unknown;
    },
) => void;

export type UseFormWatch<TFieldValues extends FieldValues> = {
    /**
     * Watch and subscribe to the entire form update/change based on onChange and re-render at the useForm.
     *
     * @remarks
     * [API](https://react-hook-form.com/docs/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @returns return the entire form values
     *
     * @example
     * ```tsx
     * const formValues = watch();
     * ```
     */
    (): TFieldValues;
    /**
     * Watch and subscribe to an array of fields used outside of render.
     *
     * @remarks
     * [API](https://react-hook-form.com/docs/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @param names - an array of field names
     * @param defaultValue - defaultValues for the entire form
     *
     * @returns return an array of field values
     *
     * @example
     * ```tsx
     * const [name, name1] = watch(["name", "name1"]);
     * ```
     */
    <TFieldNames extends readonly FieldPath<TFieldValues>[]>(
        names: readonly [...TFieldNames],
        defaultValue?: DeepPartial<TFieldValues>,
    ): FieldPathValues<TFieldValues, TFieldNames>;
    /**
     * Watch and subscribe to a single field used outside of render.
     *
     * @remarks
     * [API](https://react-hook-form.com/docs/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @param name - the path name to the form field value.
     * @param defaultValue - defaultValues for the entire form
     *
     * @returns return the single field value
     *
     * @example
     * ```tsx
     * const name = watch("name");
     * ```
     */
    <TFieldName extends FieldPath<TFieldValues>>(
        name: TFieldName,
        defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
    ): FieldPathValue<TFieldValues, TFieldName>;
    /**
     * Subscribe to field update/change without trigger re-render
     *
     * @remarks
     * [API](https://react-hook-form.com/docs/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @param callback - call back function to subscribe all fields change and return unsubscribe function
     * @param defaultValues - defaultValues for the entire form
     *
     * @returns unsubscribe function
     *
     * @example
     * ```tsx
     * useEffect(() => {
     *   const { unsubscribe } = watch((value) => {
     *     console.log(value);
     *   });
     *   return () => unsubscribe();
     * }, [watch])
     * ```
     */
    (
        callback: WatchObserver<TFieldValues>,
        defaultValues?: DeepPartial<TFieldValues>,
    ): Subscription;
    };

    export type Field = {
        _f: {
          ref: Ref;
          name: InternalFieldName;
          refs?: HTMLInputElement[];
          mount?: boolean;
        } & RegisterOptions;
    };

    
    export type ValidationMode = {
        readonly onBlur: 'onBlur';
        readonly onChange: 'onChange';
        readonly onSubmit: 'onSubmit';
        readonly onTouched: 'onTouched';
        readonly all: 'all';
    };

    export type Mode = 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';

    export type CriteriaMode = 'firstError' | 'all';

    export type ResolverSuccess<TFieldValues extends FieldValues = FieldValues> = {
        values: TFieldValues;
        errors: {};
    };
      
    export type ResolverError<TFieldValues extends FieldValues = FieldValues> = {
        values: {};
        errors: FieldErrors<TFieldValues>;
    };
      
    export type ResolverResult<TFieldValues extends FieldValues = FieldValues> =
        | ResolverSuccess<TFieldValues>
        | ResolverError<TFieldValues>;
      
    export interface ResolverOptions<TFieldValues extends FieldValues> {
        criteriaMode?: CriteriaMode;
        fields: Record<InternalFieldName, Field['_f']>;
        names?: FieldName<TFieldValues>[];
        shouldUseNativeValidation: boolean | undefined;
    }

    export type UseFormResetField<TFieldValues extends FieldValues> = <
        TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    >(
        name: TFieldName,
        options?: Partial<{
            keepDirty: boolean;
            keepTouched: boolean;
            keepError: boolean;
            defaultValue: FieldPathValue<TFieldValues, TFieldName>;
        }>,
    ) => void;
      
    export type Resolver<
        TFieldValues extends FieldValues = FieldValues,
        TContext = any,
      > = (
        values: TFieldValues,
        context: TContext | undefined,
        options: ResolverOptions<TFieldValues>,
    ) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;

    export type UseFormGetValues<TFieldValues extends FieldValues> = {
        
        (): TFieldValues;
        
        <TFieldName extends FieldPath<TFieldValues>>(
          name: TFieldName,
        ): FieldPathValue<TFieldValues, TFieldName>;
        
        <TFieldNames extends FieldPath<TFieldValues>[]>(
          names: readonly [...TFieldNames],
        ): [...FieldPathValues<TFieldValues, TFieldNames>];
    };

    export type UseFormReturn<
      TFieldValues extends FieldValues = FieldValues,
      TContext = any,
      TTransformedValues extends FieldValues | undefined = undefined,
    > = {
      watch: UseFormWatch<TFieldValues>;
      getValues: UseFormGetValues<TFieldValues>;
      getFieldState: UseFormGetFieldState<TFieldValues>;
      setError: UseFormSetError<TFieldValues>;
      clearErrors: UseFormClearErrors<TFieldValues>;
      setValue: UseFormSetValue<TFieldValues>;
      trigger: UseFormTrigger<TFieldValues>;
      formState: FormState<TFieldValues>;
      resetField: UseFormResetField<TFieldValues>;
      reset: UseFormReset<TFieldValues>;
      handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues>;
      unregister: UseFormUnregister<TFieldValues>;
      //control: Control<TFieldValues, TContext>;
      register: UseFormRegister<TFieldValues>;
      setFocus: UseFormSetFocus<TFieldValues>;
    };

    export type UseFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
        > = Partial<{
        mode: Mode;
        disabled: boolean;
        reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
        defaultValues: DefaultValues<TFieldValues> | AsyncDefaultValues<TFieldValues>;
        values: TFieldValues;
        errors: FieldErrors<TFieldValues>;
        resetOptions: Parameters<UseFormReset<TFieldValues>>[1];
        resolver: Resolver<TFieldValues, TContext>;
        context: TContext;
        shouldFocusError: boolean;
        shouldUnregister: boolean;
        shouldUseNativeValidation: boolean;
        progressive: boolean;
        criteriaMode: CriteriaMode;
        delayError: number;
    }>;
  }