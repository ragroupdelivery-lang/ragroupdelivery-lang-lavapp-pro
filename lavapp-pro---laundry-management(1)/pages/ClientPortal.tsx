import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder, getServices } from '../services/api';
import { OrderItem, Service, ServiceCategory, User } from '../types';
import { useAuth } from '../hooks/useAuth';


interface CartItem {
  type: ServiceCategory;
  name: string;
  price: number;
  quantity: number;
  serviceId: string;
}

const ClientPortal: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [allServices, setAllServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedServiceType, setSelectedServiceType] = useState<'planos' | 'avulsos' | ''>('');
    const [formState, setFormState] = useState({
        customerName: '',
        customerPhone: '',
        customerCep: '',
        customerStreet: '',
        customerNumber: '',
        customerComplement: '',
        customerNeighborhood: '',
        customerCity: '',
        pickupDate: '',
        pickupShift: '',
        customerNotes: ''
    });
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'customer') {
            const addressParts = user.address?.split(',') || [];
            setFormState(prev => ({
                ...prev,
                customerName: user.name,
                customerPhone: user.phone || '',
                customerStreet: addressParts[0] || '',
            }));
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getServices();
                setAllServices(data);
            } catch (e) {
                console.error("Failed to fetch services", e);
            } finally {
                setLoadingServices(false);
            }
        }
        fetchServices();
    }, []);

    const totalPrice = useMemo(() => selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), [selectedItems]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateProgressBar(currentStep);
    }, [currentStep]);
    
    useEffect(() => {
        if(currentStep === 4) {
            const dateInput = document.getElementById('pickupDate') as HTMLInputElement;
            if (dateInput) {
                const today = new Date();
                dateInput.min = today.toISOString().split('T')[0];
                const maxDate = new Date(today);
                maxDate.setDate(maxDate.getDate() + 30);
                dateInput.max = maxDate.toISOString().split('T')[0];
            }
        }
    }, [currentStep]);

    const updateProgressBar = (step: number) => {
        for (let i = 1; i <= 4; i++) {
            const circle = document.getElementById(`step${i}-circle`);
            const title = document.getElementById(`step${i}-title`);
            if (!circle || !title) continue;
            const isActive = i <= step;
            circle.className = `w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'}`;
            title.className = `text-sm font-semibold transition-colors hidden md:block ${isActive ? 'text-purple-600' : 'text-gray-500'}`;
        }
    };

    const goToStep = (step: number) => {
        if ((step === 3 || step === 4) && selectedItems.length === 0) {
            alert('❌ Por favor, selecione pelo menos um item antes de continuar.');
            return;
        }
        setCurrentStep(step);
    };

    const handleSelectServiceType = (type: 'planos' | 'avulsos') => {
        setSelectedServiceType(type);
        goToStep(2);
    }
    
    const handleSwitchType = (type: 'planos' | 'avulsos') => {
        if (selectedItems.length > 0) {
            if (!confirm('⚠️ Ao trocar, seu pedido atual será limpo. Deseja continuar?')) return;
        }
        setSelectedItems([]);
        setSelectedServiceType(type);
        goToStep(2);
    }

    const addItem = (service: Service) => {
        const existingItem = selectedItems.find(item => item.name === service.name);
        if (existingItem) {
            updateItemQuantity(service.name, existingItem.quantity + 1);
        } else {
            const newItem: CartItem = {
                serviceId: service.id,
                name: service.name,
                price: service.price,
                type: service.category,
                quantity: 1
            };
            if (newItem.type === ServiceCategory.Plan) {
                 setSelectedItems(prev => [...prev.filter(i => i.type !== ServiceCategory.Plan), newItem]);
            } else {
                 setSelectedItems(prev => [...prev, newItem]);
            }
        }
    };
    
    const updateItemQuantity = (itemName: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setSelectedItems(prev => prev.filter(i => i.name !== itemName));
        } else {
            setSelectedItems(prev => prev.map(i => i.name === itemName ? { ...i, quantity: newQuantity } : i));
        }
    };

    const getItemQuantity = (name: string) => selectedItems.find(item => item.name === name)?.quantity || 0;
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAuthenticated || !user) {
            alert("Por favor, faça login ou cadastre-se para finalizar o pedido.");
            navigate('/login');
            return;
        }

        const requiredFields = [ 'pickupDate', 'pickupShift' ];
        for (const field of requiredFields) {
            if (!formState[field as keyof typeof formState]) {
                alert(`❌ Por favor, preencha o campo: ${field}`);
                document.getElementById(field)?.focus();
                return;
            }
        }
        
        const orderItems: OrderItem[] = selectedItems.map(item => ({ serviceId: item.serviceId, name: item.name, quantity: item.quantity, price: item.price }));
        const pickupDate = new Date(formState.pickupDate + 'T12:00:00').toLocaleDateString('pt-BR');
        const shiftNames: { [key: string]: string } = { 'manha': '🌅 Manhã (8h-12h)', 'tarde': '☀️ Tarde (13h-17h)', 'noite': '🌙 Noite (18h-22h)' };
        const pickupShift = shiftNames[formState.pickupShift];

        try {
            await createOrder({
                customerId: user.id,
                customerName: user.name,
                address: user.address || 'Endereço não cadastrado',
                phone: user.phone || 'Telefone não cadastrado',
                items: orderItems,
                total: totalPrice,
                collectionTime: `${pickupDate} - ${pickupShift}`
            });
            setOrderPlaced(true);
            goToStep(4);
        } catch (error) {
            alert("Houve um erro ao criar seu pedido. Tente novamente.");
            console.error(error);
        }
    };
    
    const QuantityControl: React.FC<{ service: Service; color: 'purple' | 'blue' | 'orange' | 'green' }> = ({ service, color }) => {
        const quantity = getItemQuantity(service.name);
        const colorClasses = { purple: 'bg-purple-600 hover:bg-purple-700', blue: 'bg-blue-600 hover:bg-blue-700', orange: 'bg-orange-600 hover:bg-orange-700', green: 'bg-green-600 hover:bg-green-700' };
        return (
             <div className="flex items-center justify-center space-x-2">
                <button onClick={() => updateItemQuantity(service.name, quantity - 1)} className="bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center w-8 h-8">-</button>
                <span className="font-bold text-center text-lg min-w-[2rem]">{quantity}</span>
                <button onClick={() => addItem(service)} className={`${colorClasses[color]} text-white rounded-full flex items-center justify-center w-8 h-8`}>+</button>
            </div>
        )
    };
    
    // ... rendering functions remain largely the same, but I'll paste a shortened version for brevity
    const renderServices = (category: ServiceCategory, availability: 'plan' | 'avulso' | 'both', color: 'purple' | 'blue' | 'orange' | 'green') => allServices.filter(s => s.category === category && (s.availability === availability || s.availability === 'both')).map(service => (
        <div key={service.id} className="bg-white rounded-lg p-6 text-center"><h4 className="font-bold text-lg mb-2 h-10">{service.name}</h4><div className={`text-2xl font-bold text-${color}-600 mb-2`}>R$ {service.price.toFixed(2)}</div><p className="text-sm text-gray-600 mb-4 h-12">{service.description}</p><QuantityControl service={service} color={color} /></div>
    ));
    const renderSpecialCare = () => allServices.filter(s => s.category === ServiceCategory.SpecialCare).map(service => (
        <article key={service.id} className="bg-white rounded-xl shadow-lg p-6 card-hover"><h3 className="text-lg font-bold text-gray-800 mb-2 h-10">{service.name}</h3><div className="text-center mb-4"><div className="text-2xl font-bold text-green-600">R$ {service.price.toFixed(2)}</div></div><QuantityControl service={service} color="green" /></article>
    ));
    const renderPackaging = (color: 'blue') => allServices.filter(s => s.category === ServiceCategory.Packaging).map(service => (
        <div key={service.id} className="bg-white rounded-lg p-6 text-center"><h4 className="font-bold text-xl mb-3">{service.name}</h4><div className="text-3xl font-bold text-blue-600 mb-3">R$ {service.price.toFixed(2)}</div><p className="text-sm text-gray-600 mb-4 h-10">{service.description}</p><QuantityControl service={service} color={color} /></div>
    ));

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-4">
                 <div className="bg-white p-10 rounded-2xl shadow-lg">
                    <div className="text-8xl mb-4">✅</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Pedido Enviado com Sucesso!</h1>
                    <p className="text-xl text-gray-600 mb-8">Obrigado, {user?.name}! Recebemos seu pedido e ele já está em nosso sistema.</p>
                    <button onClick={() => { setOrderPlaced(false); setSelectedItems([]); goToStep(1); }} className="bg-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">Fazer Novo Pedido</button>
                    <Link to="/profile" className="block mt-4 text-blue-600 hover:underline">Ver meus pedidos</Link>
                 </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50">
            <header className="gradient-bg text-white py-8">
                <div className="container mx-auto px-4 text-center relative">
                    <div className="absolute top-0 right-4">
                        {isAuthenticated ? (
                            <Link to="/profile" className="bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                Olá, {user?.name}
                            </Link>
                        ) : (
                             <div className="space-x-2">
                                <Link to="/login" className="bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">Entrar</Link>
                                <Link to="/signup" className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">Cadastrar</Link>
                            </div>
                        )}
                    </div>
                    <h1 className="text-5xl font-bold mb-4">🧺 Lavapp</h1>
                    <p className="text-xl mb-2">Lavanderia Delivery Premium</p>
                </div>
            </header>

            <nav className="bg-white shadow-lg sticky top-0 z-40" aria-label="Progresso do Pedido">
                 <div className="container mx-auto px-4 py-6"><div className="flex justify-center items-center space-x-4 max-w-4xl mx-auto"><div className="flex items-center"><div id="step1-circle" className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">1</div><div className="ml-3"><div id="step1-title" className="text-sm font-semibold hidden md:block">Apresentação</div></div></div><div className="w-8 h-0.5 bg-gray-300"></div><div className="flex items-center"><div id="step2-circle" className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">2</div><div className="ml-3"><div id="step2-title" className="text-sm font-semibold hidden md:block">Montar Pedido</div></div></div><div className="w-8 h-0.5 bg-gray-300"></div><div className="flex items-center"><div id="step3-circle" className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">3</div><div className="ml-3"><div id="step3-title" className="text-sm font-semibold hidden md:block">Confirmação</div></div></div><div className="w-8 h-0.5 bg-gray-300"></div><div className="flex items-center"><div id="step4-circle" className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">4</div><div className="ml-3"><div id="step4-title" className="text-sm font-semibold hidden md:block">Enviar</div></div></div></div></div>
            </nav>

            <main>
                {currentStep === 1 && ( <section id="step1" className="py-16"><div className="container mx-auto px-4"><div className="text-center mb-12"><h2 className="text-4xl font-bold text-gray-800 mb-4">🧺 Bem-vindo à Lavapp!</h2><p className="text-xl text-gray-600 mb-8">Escolha como deseja usar nossos serviços</p><div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"><article className="bg-white rounded-xl shadow-lg p-8 card-hover"><div className="text-6xl mb-4">📋</div><h3 className="text-2xl font-bold text-gray-800 mb-4">Planos Mensais</h3><p className="text-gray-600 mb-6">Assinatura com desconto e comodidade</p><button onClick={() => handleSelectServiceType('planos')} className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700">Ver Planos Mensais</button></article><article className="bg-white rounded-xl shadow-lg p-8 card-hover"><div className="text-6xl mb-4">🧼</div><h3 className="text-2xl font-bold text-gray-800 mb-4">Serviços Avulsos</h3><p className="text-gray-600 mb-6">Pagamento por uso, ideal para necessidades pontuais</p><button onClick={() => handleSelectServiceType('avulsos')} className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700">Ver Serviços Avulsos</button></article></div></div></div></section> )}
                {currentStep === 2 && loadingServices && <div className="text-center py-16">Carregando serviços...</div>}
                {currentStep === 2 && !loadingServices && selectedServiceType === 'planos' && ( <section className="py-16"><div className="container mx-auto px-4"><div className="text-center mb-12"><h2 className="text-4xl font-bold text-gray-800">📋 Planos Mensais</h2></div><div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">{allServices.filter(s => s.category === ServiceCategory.Plan).map(plan => (<article key={plan.id} className="bg-white rounded-xl shadow-lg p-8 card-hover"><h3 className="text-2xl font-bold text-center text-gray-800">{plan.name}</h3><div className="text-center my-6"><div className="text-4xl font-bold text-purple-600">R$ {plan.price.toFixed(2)}</div></div><button onClick={() => addItem(plan)} className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700">Escolher</button></article>))}</div><div className="bg-purple-50 rounded-2xl p-8"><h3 className="text-2xl font-bold text-center mb-4 text-gray-800">🎯 Extras para Assinantes</h3><div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">{renderServices(ServiceCategory.Extra, 'plan', 'purple')}</div></div><div className="bg-blue-50 rounded-2xl p-8 mt-16"><h3 className="text-2xl font-bold text-center mb-4 text-gray-800">📦 Opções de Embalagem</h3><div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">{renderPackaging('blue')}</div></div><div className="text-center mt-12 space-y-4"><button onClick={() => goToStep(3)} className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700">Continuar →</button><div><button onClick={() => handleSwitchType('avulsos')} className="text-blue-600 hover:text-blue-800 underline font-medium">🔄 Prefiro Serviços Avulsos</button></div></div></div></section> )}
                {currentStep === 2 && !loadingServices && selectedServiceType === 'avulsos' && ( <section className="py-16"><div className="container mx-auto px-4"><div className="text-center mb-12"><h2 className="text-4xl font-bold text-gray-800">🧼 Serviços Avulsos</h2></div><div className="mb-16"><h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Serviço Base</h3><div className="flex justify-center">{allServices.filter(s => s.category === ServiceCategory.Base).map(service => (<article key={service.id} className="bg-white rounded-xl shadow-lg p-8 card-hover max-w-sm"><h3 className="text-2xl font-bold text-center">{service.name}</h3><div className="text-center my-6"><div className="text-4xl font-bold text-blue-600">R$ {service.price.toFixed(2)}</div></div><QuantityControl service={service} color="blue" /></article>))}</div></div><div className="bg-orange-50 rounded-2xl p-8 mb-16"><h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Extras para Cesto</h3><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">{renderServices(ServiceCategory.Extra, 'avulso', 'orange')}</div></div><div><h3 className="text-2xl font-bold text-center mb-8 text-gray-800">✨ Cuidados Especiais</h3><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">{renderSpecialCare()}</div></div><div className="bg-blue-50 rounded-2xl p-8 mt-16"><h3 className="text-2xl font-bold text-center mb-4 text-gray-800">📦 Opções de Embalagem</h3><div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">{renderPackaging('blue')}</div></div><div className="text-center mt-12 space-y-4"><button onClick={() => goToStep(3)} className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700">Continuar →</button><div><button onClick={() => handleSwitchType('planos')} className="text-purple-600 hover:text-purple-800 underline font-medium">🔄 Prefiro Planos Mensais</button></div></div></div></section> )}
                {currentStep === 3 && ( <section className="py-16"><div className="container mx-auto px-4 max-w-2xl"><div className="text-center mb-8"><h2 className="text-4xl font-bold text-gray-800">✅ Confirmação do Pedido</h2></div><div className="bg-white rounded-2xl shadow-lg p-8"><div className="mb-8"><h3 className="text-xl font-semibold mb-6 text-gray-800">📋 Resumo</h3><div className="space-y-3 mb-6">{selectedItems.length === 0 ? (<p>Nenhum item selecionado</p>) : (selectedItems.map(item => (<div key={item.name} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"><div><span className="font-semibold">{item.name}</span>{item.quantity > 1 && <span className="text-gray-500 ml-2">x{item.quantity}</span>}</div><div className="flex items-center space-x-3"><span className="font-bold text-lg">R$ {(item.price * item.quantity).toFixed(2)}</span><button onClick={() => updateItemQuantity(item.name, 0)} className="text-red-500 hover:text-red-700">🗑️</button></div></div>)))}</div><div className="border-t pt-6"><div className="flex justify-between items-center text-2xl font-bold text-purple-600"><span>Total:</span><span>R$ {totalPrice.toFixed(2)}</span></div></div></div><div className="flex gap-4"><button onClick={() => goToStep(2)} className="flex-1 bg-gray-500 text-white py-4 rounded-lg font-bold hover:bg-gray-600">← Voltar</button><button onClick={() => goToStep(4)} className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700">Confirmar →</button></div></div></div></section> )}
                {currentStep === 4 && ( <section className="py-16"><div className="container mx-auto px-4 max-w-2xl"><div className="text-center mb-8"><h2 className="text-4xl font-bold text-gray-800">📱 Finalizar Pedido</h2><p className="text-xl text-gray-600">{isAuthenticated ? `Coleta para ${user?.name}` : "Crie uma conta para continuar"}</p></div><div className="bg-white rounded-2xl shadow-lg p-8"><form onSubmit={handleSubmit} className="space-y-6">{isAuthenticated ? (<> <fieldset className="bg-gray-50 p-6 rounded-lg"><legend className="text-lg font-semibold text-gray-800 mb-4">📍 Endereço de Coleta</legend><p>{user?.address}</p><Link to="/profile" className="text-sm text-blue-600 hover:underline">Editar endereço no perfil</Link></fieldset><fieldset className="bg-gray-50 p-6 rounded-lg"><div className="grid md:grid-cols-2 gap-4"><div><label htmlFor="pickupDate" className="block text-sm font-semibold text-gray-700 mb-2">Data da Coleta *</label><input type="date" id="pickupDate" value={formState.pickupDate} onChange={(e) => setFormState(p => ({...p, pickupDate: e.target.value}))} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div><div><label htmlFor="pickupShift" className="block text-sm font-semibold text-gray-700 mb-2">Turno *</label><select id="pickupShift" value={formState.pickupShift} onChange={(e) => setFormState(p => ({...p, pickupShift: e.target.value}))} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"><option value="">Selecione</option><option value="manha">🌅 Manhã (8h-12h)</option><option value="tarde">☀️ Tarde (13h-17h)</option><option value="noite">🌙 Noite (18h-22h)</option></select></div></div></fieldset><button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700">Finalizar Pedido</button> </> ) : (<div className="text-center"><p className="mb-4">Você precisa estar logado para finalizar um pedido.</p><Link to="/login" className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700">Ir para Login</Link></div>)}</form></div></div></section> )}
            </main>

            <footer className="bg-gray-800 text-white py-12 mt-16">
                 <div className="container mx-auto px-4 text-center"><h3 className="text-3xl font-bold mb-4">🧺 Lavapp</h3><p>Mais tempo para você</p></div>
            </footer>
        </div>
    );
};

export default ClientPortal;
