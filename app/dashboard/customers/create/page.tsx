import CustomerForm from '@/app/ui/customers/form';
import { createCustomer } from '@/app/lib/actions';

export default function Page() {
  return <CustomerForm action={createCustomer} />;
}