import React from 'react'
import { appPlans } from '../assets/assets';
import Footer from '../components/Footer';
import { useSession } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: string;
  credits: number;
  description: string;
  features: string[];
}

const Pricing = () => {
    const [plans] = React.useState<Plan[]>(appPlans)
    const { data: session } = useSession()
    const navigate = useNavigate()

    const handlePurchase = async (planId: string) => {
        if (planId === 'free') {
            if (session?.user) {
                toast.info('You are already using the Free Trial credits.')
            } else {
                navigate('/auth/signup')
            }
            return
        }
        // Payment provider integration placeholder
        toast.info('Payment gateway integration will be configured in the next update!')
    }

  return (
    <>
      <div className='w-full max-w-5xl mx-auto z-20 max-md:px-4 min-h-[80vh]'>
        <div className='text-center mt-16'>
          <h2 className='text-gray-100 text-3xl font-medium'>Choose Your Plan</h2>
          <p className='text-gray-400 mt-2 mx-auto max-w-md text-sm'>Start for free and scale up as you grow. Find the perfect plan for your website creation needs.</p>
        </div>
        <div className='pt-14 py-4 px-4 '>
                    <div className='grid grid-cols-1 md:grid-cols-4 flex-wrap gap-4'>
                        {plans.map((plan, idx) => (
                            <div key={idx} className="p-6 bg-black/20 ring ring-indigo-950 mx-auto w-full max-w-sm rounded-lg text-white shadow-lg hover:ring-indigo-500 transition-all duration-400 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <div className="my-2">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-gray-300"> / {plan.credits} credits</span>
                                    </div>

                                    <p className="text-gray-300 mb-6 text-sm">{plan.description}</p>

                                    <ul className="space-y-1.5 mb-6 text-xs">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <svg className="h-4 w-4 text-indigo-300 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-gray-400">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button 
                                    onClick={() => handlePurchase(plan.id)} 
                                    className={`w-full py-2 px-4 rounded-md transition-all active:scale-95 text-sm font-semibold mt-4 ${
                                        plan.id === 'free' && session?.user
                                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed hover:bg-slate-800 active:scale-100'
                                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                    }`}
                                    disabled={plan.id === 'free' && !!session?.user}
                                >
                                    {plan.id === 'free' 
                                        ? (session?.user ? 'Current Plan' : 'Start Free Trial') 
                                        : 'Buy Now'
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <p className='mx-auto text-center text-sm max-w-md mt-10 text-white/60 font-light'>Project <span className='text-white'>Creation / Revision</span> consumes <span className='text-white'>5 credits</span>. You can purchase more credits to create more projects.</p>
      </div>
      <Footer />
    </>
  )
}

export default Pricing