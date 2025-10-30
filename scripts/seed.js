// import 'dotenv/config';
// import mongoose from 'mongoose';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// import Customer from './models/Customer.js';
// import Account from './models/Account.js';
// import Transaction from './models/Transaction.js';

// const MONGO_URI = process.env.MONGO_URI;
// const CLEAR_DB = process.env.CLEAR_DB === 'true';

// async function seed() {
//   console.log('Connecting to MongoDB...', MONGO_URI);
//   await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//   try {
//     if (CLEAR_DB) {
//       console.log('Cleaning up collections: customers, accounts, transactions');
//       await Promise.all([
//         Customer.deleteMany({}),
//         Account.deleteMany({}),
//         Transaction.deleteMany({})
//       ]);
//     } else {
//       console.log('CLEAR_DB=false -> keeping existing data and adding new data');
//     }

//     const customersData = [
//       { name: "Joana Silva", cpf: "842.832.580-40", email: "joana.silva@email.com" },
//       { name: "Mel Gerardi", cpf: "742.382.090-36", email: "mel.gerardi@email.com" },
//       { name: "Carlos Pereira", cpf: "445.069.610-72", email: "carlos.pereira@email.com" },
//       { name: "Danilo Santos", cpf: "798.339.250-81", email: "danilo.santos@email.com" },
//       { name: "Rafael Souza", cpf: "867.047.530-87", email: "rafael.souza@email.com" },
//       { name: "Luciana Rocha", cpf: "470.383.130-96", email: "luciana.rocha@email.com" }
//     ];

//     console.log('Creating customers...');
//     const customers = [];
//     for (const c of customersData) {
//       const created = await Customer.create({
//         name: c.name,
//         cpf: c.cpf.replace(/\D/g, ''),
//         email: c.email
//       });
//       customers.push(created);
//       console.log('  customer created:', created._id.toString(), created.name);
//     }

//     const accountsData = [
//       { customerIndex: 0, type: 'checking', branch: '0001', number: '10001-1', initialBalance: 2500.75, bankId: 'BANK_A', sharingAllowed: true },
//       { customerIndex: 1, type: 'checking', branch: '0001', number: '10002-2', initialBalance: 5800.00, bankId: 'BANK_A', sharingAllowed: true },
//       { customerIndex: 2, type: 'savings', branch: '0002', number: '20001-1', initialBalance: 1200.00, bankId: 'BANK_B', sharingAllowed: false },
//       { customerIndex: 3, type: 'checking', branch: '0002', number: '20002-2', initialBalance: 500.00, bankId: 'BANK_B', sharingAllowed: true },
//       { customerIndex: 4, type: 'checking', branch: '0003', number: '30001-1', initialBalance: 300.00, bankId: 'BANK_C', sharingAllowed: false },
//       { customerIndex: 5, type: 'savings', branch: '0003', number: '30002-2', initialBalance: 15000.00, bankId: 'BANK_C', sharingAllowed: true }
//     ];

//     console.log('Creating accounts...');
//     const accounts = [];
//     for (const a of accountsData) {
//       const cust = customers[a.customerIndex];
//       const acc = await Account.create({
//         type: a.type,
//         branch: a.branch,
//         number: a.number,
//         balance: Number(a.initialBalance),
//         customer: cust._id,
//         bankId: a.bankId,
//         sharingAllowed: a.sharingAllowed
//       });

//       cust.accounts.push(acc._id);
//       await cust.save();
//       accounts.push(acc);
//       console.log('  account created:', acc._id.toString(), 'customer:', cust.name, 'bank:', a.bankId, 'sharingAllowed:', a.sharingAllowed);
//     }

//     console.log('Creating transactions...');
//     const txnExamples = [
//       (accId) => ({ date: '2025-09-09', description: 'Deposit', amount: 1000.00, type: 'credit', category: 'Income', account: accId }),
//       (accId) => ({ date: '2025-09-10', description: 'Deposit', amount: 300.00, type: 'credit', category: 'Income', account: accId }),
//       (accId) => ({ date: '2025-09-14', description: 'Withdrawal', amount: 150.00, type: 'debit', category: 'Cash', account: accId })
//     ];

//     for (const acc of accounts) {
//       const txn1 = await Transaction.create(txnExamples[0](acc._id));
//       const txn2 = await Transaction.create(txnExamples[2](acc._id));

//       acc.transactions.push(txn1._id, txn2._id);
//       acc.balance = acc.balance + txn1.amount - txn2.amount;
//       await acc.save();

//       console.log(`  transactions created for account ${acc._id.toString()}: txn1=${txn1._id.toString()} txn2=${txn2._id.toString()} newBalance=${acc.balance}`);
//     }

//     console.log('Seed completed successfully!');

//   } catch (err) {
//     console.error('Error during seed:', err);
//   } finally {
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   }
// }

// seed().catch(e => {
//   console.error('Seed failed:', e);
//   process.exit(1);
// });