// Every per-category form shares this contract: it owns its own field state, and calls
// onSubmit with the identifier/amount (plus network, for Airtime/Data) once its own
// validation passes. onSubmit runs the actual API call and returns whether it succeeded, so
// the form knows whether to reset its fields.
export interface BillSubmitPayload {
  identifier: string;
  amount: number;
  network?: string;
}

export interface BillFormProps {
  submitting: boolean;
  onSubmit: (payload: BillSubmitPayload) => Promise<boolean>;
}
