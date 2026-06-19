import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { Product, Customer, Transaction } from '../types';

export async function fetchAllDataFromFirestore() {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    const customersSnap = await getDocs(collection(db, 'customers'));
    const transactionsSnap = await getDocs(collection(db, 'transactions'));

    const products: Product[] = [];
    productsSnap.forEach((d) => {
      products.push(d.data() as Product);
    });

    const customers: Customer[] = [];
    customersSnap.forEach((d) => {
      customers.push(d.data() as Customer);
    });

    const transactions: Transaction[] = [];
    transactionsSnap.forEach((d) => {
      transactions.push(d.data() as Transaction);
    });

    // Sort transactions chronologically (latest first, like local storage)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { products, customers, transactions };
  } catch (err) {
    console.error('Failed to pull from Firestore: ', err);
    throw err;
  }
}

export async function seedInitialDataToFirestore(
  products: Product[],
  customers: Customer[],
  transactions: Transaction[]
) {
  try {
    const batch = writeBatch(db);

    products.forEach((p) => {
      const docRef = doc(db, 'products', p.id);
      batch.set(docRef, p);
    });

    customers.forEach((c) => {
      const docRef = doc(db, 'customers', c.id);
      batch.set(docRef, c);
    });

    transactions.forEach((t) => {
      const docRef = doc(db, 'transactions', t.id);
      batch.set(docRef, t);
    });

    await batch.commit();
    console.log('Successfully seeded database to Google Cloud Firestore!');
  } catch (err) {
    console.error('Failed to seed raw database to Cloud Firestore: ', err);
  }
}

export async function saveProductToFirestore(p: Product) {
  try {
    await setDoc(doc(db, 'products', p.id), p);
  } catch (e) {
    console.error('Failed saving product: ', e);
  }
}

export async function deleteProductFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (e) {
    console.error('Failed deleting product: ', e);
  }
}

export async function saveCustomerToFirestore(c: Customer) {
  try {
    await setDoc(doc(db, 'customers', c.id), c);
  } catch (e) {
    console.error('Failed saving customer: ', e);
  }
}

export async function deleteCustomerFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'customers', id));
  } catch (e) {
    console.error('Failed deleting customer: ', e);
  }
}

export async function saveTransactionToFirestore(t: Transaction) {
  try {
    await setDoc(doc(db, 'transactions', t.id), t);
  } catch (e) {
    console.error('Failed saving transaction: ', e);
  }
}

export async function deleteTransactionFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (e) {
    console.error('Failed deleting transaction: ', e);
  }
}
