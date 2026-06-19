import React, { useState, useEffect } from 'react';
import { Customer, Transaction, Product } from '../types';
import { 
  Building2, 
  Smartphone, 
  Radio, 
  Sparkles, 
  Code, 
  Cpu, 
  Wallet, 
  Terminal, 
  Check, 
  CheckCircle2, 
  Activity, 
  Wifi, 
  Shield, 
  Zap, 
  RotateCw, 
  Play, 
  Send,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentGatewaysProps {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  onEditCustomer: (cust: Customer) => void;
}

type GatewayId = 'mtn' | 'airtel' | 'flutterwave' | 'yo' | 'beyonic' | 'dpo';

interface ApiLog {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET' | 'PUT';
  endpoint: string;
  gateway: string;
  payload: string;
  response: string;
  status: '200 OK' | '201 Created' | '400 Bad Request' | '401 Unauthorized' | '500 Error';
}

export default function PaymentGateways({
  customers,
  products,
  transactions,
  onAddTransaction,
  onEditCustomer,
}: PaymentGatewaysProps) {
  const [activeGateway, setActiveGateway] = useState<GatewayId>('mtn');
  const [selectedUser, setSelectedUser] = useState<string>(customers[0]?.id || '');
  const [amount, setAmount] = useState<string>('50000');
  const [transactionType, setTransactionType] = useState<'payin' | 'payout'>('payin');
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  // API Config state (saved in LocalStorage)
  const [apiConfigs, setApiConfigs] = useState({
    mtn: { client_id: 'momo-user-92', client_secret: 'sec_********77', env: 'sandbox' },
    airtel: { client_id: 'airtel-corp-12', client_secret: 'sec_********94', env: 'sandbox' },
    flutterwave: { public_key: 'FLWPUBK_TEST-5f6a9e1d...', secret_key: 'FLWSECK_TEST-********', env: 'sandbox' },
    yo: { username: 'yopay_user_1', pin: '****', env: 'sandbox' },
    beyonic: { api_key: 'BEY_TEST_********', env: 'sandbox' },
    dpo: { company_token: 'DPO_COMP_********', service_type: '3851', env: 'sandbox' }
  });

  useEffect(() => {
    // Load local logs or configs if any
    const storedLogs = localStorage.getItem('bt_api_logs');
    if (storedLogs) {
      setApiLogs(JSON.parse(storedLogs));
    } else {
      // Seed initial logs
      const seedLogs: ApiLog[] = [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000).toLocaleString(),
          method: 'POST',
          endpoint: '/momo/v1_0/requesttopay',
          gateway: 'MTN MoMo API',
          payload: JSON.stringify({ amount: "10000", currency: "UGX", externalId: "tx-starter-101", payer: { partyIdType: "MSISDN", partyId: "256772458912" } }, null, 2),
          response: JSON.stringify({ status: "Accepted", resourceId: "res-9082a-bf" }, null, 2),
          status: '202 Accepted' as any
        }
      ];
      setApiLogs(seedLogs);
      localStorage.setItem('bt_api_logs', JSON.stringify(seedLogs));
    }

    const storedConfigs = localStorage.getItem('bt_api_configs');
    if (storedConfigs) {
      setApiConfigs(JSON.parse(storedConfigs));
    }
  }, []);

  const handleConfigChange = (gate: GatewayId, field: string, value: string) => {
    const updated = {
      ...apiConfigs,
      [gate]: {
        ...apiConfigs[gate],
        [field]: value
      }
    };
    setApiConfigs(updated);
    localStorage.setItem('bt_api_configs', JSON.stringify(updated));
  };

  const getGatewayName = (id: GatewayId) => {
    switch (id) {
      case 'mtn': return 'MTN MoMo Open API';
      case 'airtel': return 'Airtel Money Developer API';
      case 'flutterwave': return 'Flutterwave Standard Integrations';
      case 'yo': return 'Yo! Payments API';
      case 'beyonic': return 'Beyonic Mobile Payout API';
      case 'dpo': return 'DPO Group Commerce API';
    }
  };

  const getGateways = () => [
    { id: 'mtn' as GatewayId, name: 'MTN MoMo', logo: '🟡', type: 'Telecom Operator' },
    { id: 'airtel' as GatewayId, name: 'Airtel Money', logo: '🔴', type: 'Telecom Operator' },
    { id: 'flutterwave' as GatewayId, name: 'Flutterwave', logo: '🧡', type: 'Aggregator / Card' },
    { id: 'yo' as GatewayId, name: 'Yo! Payments', logo: '🔵', type: 'Aggregator' },
    { id: 'beyonic' as GatewayId, name: 'Beyonic', logo: '💜', type: 'Aggregator / Enterprise' },
    { id: 'dpo' as GatewayId, name: 'DPO Group', logo: '💚', type: 'E-commerce Aggregator' }
  ];

  const triggerApiSimulation = async () => {
    const targetUser = customers.find(c => c.id === selectedUser);
    if (!targetUser) {
      alert('Please select an investor to associate this API transaction with!');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      alert('Please specify a valid payment amount!');
      return;
    }

    setSimulating(true);
    setSimulationStatus('Handshaking and authenticating with gateway secure API servers...');

    // Wait 1200ms to simulate the network request / handshake
    await new Promise(r => setTimeout(r, 1200));

    setSimulationStatus(`Processing ${transactionType === 'payin' ? 'C2B Collection pull' : 'B2C Disbursement push'} request...`);

    await new Promise(r => setTimeout(r, 1000));

    // Formulate API request and response mock logging
    let method: 'POST' | 'GET' = 'POST';
    let endpoint = '';
    let payloadObj: any = {};
    let responseObj: any = {};
    let statusPhrase: any = '200 OK';

    const cleanPhone = targetUser.phone.replace(/[^0-9+]/g, '');

    switch (activeGateway) {
      case 'mtn':
        endpoint = transactionType === 'payin' ? '/collection/v1_0/requesttopay' : '/disbursement/v1_0/transfer';
        payloadObj = {
          amount: amtNum.toString(),
          currency: 'UGX',
          externalId: `momo-tx-${Date.now().toString().slice(-6)}`,
          payer: {
            partyIdType: 'MSISDN',
            partyId: cleanPhone
          },
          payerNote: `${transactionType === 'payin' ? 'Deposit in 2K POWER APP' : 'Yield Payout from 2K POWER APP'}`,
          payeeNote: 'Official Criss Julius high-yield escrow system'
        };
        responseObj = {
          status: 'Successful',
          financialTransactionId: `mtn-fi-${Math.floor(Math.random() * 900000000 + 100000000)}`,
          payee: cleanPhone,
          timestamp: new Date().toISOString()
        };
        statusPhrase = '202 Accepted';
        break;

      case 'airtel':
        endpoint = transactionType === 'payin' ? '/merchant/v1/payments/' : '/disbursements/v1/payout/';
        payloadObj = {
          transaction: {
            amount: amtNum,
            currency: 'UGX',
            id: `airtel-tx-${Date.now().toString().slice(-6)}`,
            service_type: transactionType === 'payin' ? 'c2b_pull' : 'b2c_push'
          },
          subscriber: {
            msisdn: cleanPhone
          }
        };
        responseObj = {
          status: {
            code: '200',
            success: true,
            message: 'Transaction Completed Successfully'
          },
          data: {
            transaction: {
              id: `airtel-ref-${Math.floor(Math.random() * 9000000 + 1000000)}`,
              status: 'SUCCESS'
            }
          }
        };
        break;

      case 'flutterwave':
        endpoint = transactionType === 'payin' ? '/v3/charges?type=mobile_money_uganda' : '/v3/transfers';
        payloadObj = transactionType === 'payin' ? {
          amount: amtNum,
          currency: 'UGX',
          email: targetUser.email,
          phone_number: cleanPhone,
          tx_ref: `flw-tx-${Date.now()}`,
          fullname: targetUser.name
        } : {
          account_bank: 'MPS',
          account_number: cleanPhone,
          amount: amtNum,
          narration: '2K POWER APP HIGH YIELD DIVIDENDS',
          currency: 'UGX',
          callback_url: 'https://ais-pre-nibgjeixvomxcm2xv6kb3h-967103159752.europe-west2.run.app/api/webhooks/flutterwave'
        };
        responseObj = {
          status: 'success',
          message: transactionType === 'payin' ? 'Charge initiated' : 'Transfer queued successfully',
          data: {
            id: Math.floor(Math.random() * 10000000),
            tx_ref: `flw-ref-${Math.floor(Math.random() * 900000)}`,
            amount: amtNum,
            status: 'NEW'
          }
        };
        break;

      case 'yo':
        endpoint = '/services/yopayments/task.php';
        payloadObj = transactionType === 'payin' ? {
          method: 'acdepositrequest',
          amount: amtNum,
          account: cleanPhone,
          narrative: 'Yo! Deposit To 2K Power'
        } : {
          method: 'acwithdrawrequest',
          amount: amtNum,
          account: cleanPhone,
          narrative: 'Yo! Payout Yield From 2K Power'
        };
        responseObj = {
          response: {
            status: 'OK',
            transaction_reference: `yo-ref-${Math.floor(Math.random() * 900000)}`,
            status_code: '0',
            status_message: 'Success'
          }
        };
        break;

      case 'beyonic':
        endpoint = '/api/transactions';
        payloadObj = {
          amount: amtNum,
          currency: 'UGX',
          phonenumber: cleanPhone,
          payment_type: transactionType === 'payin' ? 'collection' : 'payout',
          description: 'Beyonic high-velocity mobile transaction'
        };
        responseObj = {
          id: Math.floor(Math.random() * 900000),
          status: 'processed',
          amount: amtNum,
          currency: 'UGX',
          phone: cleanPhone,
          remote_transaction_id: `bey-rem-tx-${Math.floor(Math.random() * 9000)}`
        };
        break;

      case 'dpo':
        endpoint = '/API/v6/';
        payloadObj = {
          API3G: {
            CompanyToken: apiConfigs.dpo.company_token,
            Request: 'createToken',
            Transaction: {
              TransactionAmount: amtNum,
              TransactionCurrency: 'UGX',
              CompanyRef: `dpo-ref-${Math.floor(Math.random() * 90000)}`,
              RedirectURL: 'https://ais-pre-nibgjeixvomxcm2xv6kb3h-967103159752.europe-west2.run.app/success',
              BackURL: 'https://ais-pre-nibgjeixvomxcm2xv6kb3h-967103159752.europe-west2.run.app/back'
            },
            Services: {
              Service: {
                ServiceType: apiConfigs.dpo.service_type,
                ServiceDescription: '2K Power App Deposit Option',
                ServiceDate: new Date().toISOString().split('T')[0]
              }
            }
          }
        };
        responseObj = {
          API3G: {
            Response: 'OK',
            Result: '000',
            ResultExplanation: 'Transaction Created Successfully',
            TransToken: `DPO-TOKEN-${Math.floor(Math.random() * 9000000 + 1000000)}`
          }
        };
        break;
    }

    const logId = `log-${Date.now()}`;
    const newLog: ApiLog = {
      id: logId,
      timestamp: new Date().toLocaleString(),
      method,
      endpoint,
      gateway: getGatewayName(activeGateway),
      payload: JSON.stringify(payloadObj, null, 2),
      response: JSON.stringify(responseObj, null, 2),
      status: statusPhrase
    };

    const updatedLogs = [newLog, ...apiLogs].slice(0, 50); // limit to last 50
    setApiLogs(updatedLogs);
    localStorage.setItem('bt_api_logs', JSON.stringify(updatedLogs));

    // Commit ledger action to make sure the data persists and flows back to the applet database!
    onAddTransaction({
      type: transactionType === 'payin' ? 'inflow' : 'outflow',
      amount: amtNum,
      date: new Date().toISOString(),
      description: `[${getGatewayName(activeGateway)}] ${
        transactionType === 'payin' ? 'Secured API Deposit' : 'Dispatched API Yield Payout'
      } for ${targetUser.name}`,
      customerId: targetUser.id,
      category: transactionType === 'payin' ? 'Sale Revenue' : 'Refund Reimbursement',
      paymentMethod: activeGateway === 'airtel' ? 'Airtel Money' : 'MTN'
    });

    // Automatically increase user's totals
    if (transactionType === 'payin') {
      const updatedUser = {
        ...targetUser,
        totalSpent: targetUser.totalSpent + amtNum,
        totalOrders: targetUser.totalOrders + 1,
        lastActive: new Date().toISOString()
      };
      onEditCustomer(updatedUser);
    } else {
      // For payout, deduct slightly or update activity
      const updatedUser = {
        ...targetUser,
        lastActive: new Date().toISOString()
      };
      onEditCustomer(updatedUser);
    }

    setSimulating(false);
    setSimulationStatus(null);
    alert(`Success! Simulated API transaction completed. Added to ${activeGateway === 'airtel' ? 'Airtel' : 'MTN'} ledger list.`);
  };

  const clearLogHistory = () => {
    setApiLogs([]);
    localStorage.removeItem('bt_api_logs');
  };

  return (
    <div id="payment-gateways-container" className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              <Cpu className="h-3.5 w-3.5 animate-pulse text-indigo-600" /> Integrated API Handlers & Gateways
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-800 mt-2">Ugandan Telecom & Aggregator Gateways</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Connect private API keys for MTN MoMo OpenAPI, Airtel Money API, or aggregators such as Flutterwave, Yo!, Beyonic & DPO Group. Run simulated sandbox endpoints instantly.
            </p>
          </div>
          <button
            onClick={clearLogHistory}
            className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-all"
          >
            Clear Log Console
          </button>
        </div>

        {/* Responsive Gateway Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {getGateways().map((g) => {
            const isSelected = activeGateway === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGateway(g.id);
                  setSimulationStatus(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all select-none hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">{g.logo}</span>
                <span className="text-xs font-bold font-sans tracking-tight">{g.name}</span>
                <span className={`text-[8px] font-mono mt-1 font-semibold block rounded px-1 py-0.5 ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  {g.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: API Configuration & Simulated Endpoint Runner */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* API Configuration Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-150">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 font-mono">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>{getGatewayName(activeGateway)} Config</span>
            </h4>

            <div className="space-y-4">
              {activeGateway === 'mtn' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">User Client ID / Dev User</label>
                    <input
                      type="text"
                      value={apiConfigs.mtn.client_id}
                      onChange={(e) => handleConfigChange('mtn', 'client_id', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">API User Client Secret</label>
                    <input
                      type="password"
                      value={apiConfigs.mtn.client_secret}
                      onChange={(e) => handleConfigChange('mtn', 'client_secret', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {activeGateway === 'airtel' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Airtel Client ID / Partner ID</label>
                    <input
                      type="text"
                      value={apiConfigs.airtel.client_id}
                      onChange={(e) => handleConfigChange('airtel', 'client_id', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Airtel Client Secret Key</label>
                    <input
                      type="password"
                      value={apiConfigs.airtel.client_secret}
                      onChange={(e) => handleConfigChange('airtel', 'client_secret', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {activeGateway === 'flutterwave' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Flutterwave Secret Key (sec_key)</label>
                    <input
                      type="password"
                      value={apiConfigs.flutterwave.secret_key}
                      onChange={(e) => handleConfigChange('flutterwave', 'secret_key', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Flutterwave Public ID (pub_key)</label>
                    <input
                      type="text"
                      value={apiConfigs.flutterwave.public_key}
                      onChange={(e) => handleConfigChange('flutterwave', 'public_key', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {activeGateway === 'yo' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Yo! API Username</label>
                    <input
                      type="text"
                      value={apiConfigs.yo.username}
                      onChange={(e) => handleConfigChange('yo', 'username', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Yo! Merchant PIN Code</label>
                    <input
                      type="password"
                      value={apiConfigs.yo.pin}
                      onChange={(e) => handleConfigChange('yo', 'pin', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {activeGateway === 'beyonic' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Beyonic Secret API Authorization Token</label>
                  <input
                    type="password"
                    value={apiConfigs.beyonic.api_key}
                    onChange={(e) => handleConfigChange('beyonic', 'api_key', e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                  />
                </div>
              )}

              {activeGateway === 'dpo' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">DPO Global Company Token</label>
                    <input
                      type="password"
                      value={apiConfigs.dpo.company_token}
                      onChange={(e) => handleConfigChange('dpo', 'company_token', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">DPO Core Service Type Code</label>
                    <input
                      type="text"
                      value={apiConfigs.dpo.service_type}
                      onChange={(e) => handleConfigChange('dpo', 'service_type', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">API Endpoint Protocol Mode</label>
                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 font-mono">
                    <Wifi className="h-3 w-3" /> Sandbox Test
                  </button>
                  <button className="flex-1 bg-slate-50 text-slate-400 border border-slate-205 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 font-mono cursor-not-allowed" title="Live environment requires complete KYC audit certs!">
                    <Shield className="h-3 w-3" /> Production Live
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Simulate Action Section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-150">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 font-mono">
              <Zap className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span>Sandbox Action Core</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Target Account Profile</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="" disabled>--- Select Active Investor ---</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Bal: {new Intl.NumberFormat('en-US').format(c.totalSpent)} UGX
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">API Method Action</label>
                  <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 border">
                    <button
                      onClick={() => setTransactionType('payin')}
                      className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-2 rounded-md transition-all ${
                        transactionType === 'payin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Pay-In
                    </button>
                    <button
                      onClick={() => setTransactionType('payout')}
                      className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-2 rounded-md transition-all ${
                        transactionType === 'payout' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Payout
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Amount (UGX)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white text-indigo-600"
                    placeholder="E.g. 50000"
                  />
                </div>
              </div>

              {simulating ? (
                <div className="rounded-xl bg-slate-900 text-[11px] font-mono text-indigo-400 p-3 flex flex-col gap-2 border border-indigo-950">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span className="font-bold tracking-tight">API EXECUTING...</span>
                  </div>
                  <p className="text-slate-300 italic">{simulationStatus}</p>
                </div>
              ) : (
                <button
                  onClick={triggerApiSimulation}
                  className="w-full min-h-[44px] bg-gradient-to-r from-indigo-700 to-violet-600 hover:from-indigo-600 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md border border-indigo-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Play className="h-4 w-4" />
                  <span>Execute {transactionType === 'payin' ? 'Mobile money Collection' : 'Disbursement'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Webhook Log Terminal & Live Network Activity */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 text-white font-mono text-xs flex-1 flex flex-col h-full min-h-[400px] shadow-2xl relative">
            
            {/* Header decor */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/80 rounded-t-2xl border-b border-slate-800/60 flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 ml-2 font-bold uppercase tracking-wide">GATEWAYS WEBHOOK TERMINAL</span>
              </div>
              <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                <Activity className="h-3.5 w-3.5" /> 100% ONLINE
              </div>
            </div>

            <div className="flex-1 mt-6 overflow-y-auto space-y-4 pt-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {apiLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2 py-10">
                  <Terminal className="h-8 w-8 text-slate-600 animate-pulse" />
                  <span className="text-[11px] uppercase tracking-wide">Terminal log stream is empty.</span>
                  <span className="text-[9px] text-slate-600">Run an API simulation on the left to intercept requests.</span>
                </div>
              ) : (
                <AnimatePresence>
                  {apiLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-slate-900 pb-4 last:border-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 rounded-lg p-2 border border-slate-850">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase py-0.5 px-1.5 rounded ${
                            log.method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {log.method}
                          </span>
                          <span className="text-white font-bold text-[11px]">{log.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">{log.gateway}</span>
                          <span className={`text-[9px] font-black uppercase py-0.5 px-1 rounded bg-slate-850 text-slate-300`}>
                            {log.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1">HTTP Request Body</span>
                          <pre className="bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-[10px] text-emerald-300 overflow-x-auto whitespace-pre">
                            {log.payload}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1">HTTP Response JSON</span>
                          <pre className="bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-[10px] text-amber-300 overflow-x-auto whitespace-pre">
                            {log.response}
                          </pre>
                        </div>
                      </div>

                      <span className="text-[8px] text-slate-500 mt-2 block text-right">Log timestamp: {log.timestamp}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Bottom info banner */}
            <div className="mt-4 border-t border-slate-900 pt-3 flex items-center gap-2 text-[9px] text-slate-500 font-sans font-medium">
              <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Webhooks are wired dynamically to trigger state reconciliation immediately on state receipt. Standard latency is under 15ms.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
