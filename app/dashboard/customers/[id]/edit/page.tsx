import CustomerForm from '@/app/ui/customers/form';
import { fetchCustomerById } from '@/app/lib/data';
import { updateCustomer } from '@/app/lib/actions';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const customer = await fetchCustomerById(id);

  if (!customer) {
    notFound();
  }

  const updateCustomerWithId = updateCustomer.bind(null, id);

  return <CustomerForm customer={customer} action={updateCustomerWithId} />;
}