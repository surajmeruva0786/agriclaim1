import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Users, Clock, FileCheck, DollarSign, Wheat, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import Footer from '../components/Footer';
import FloatingOrbs from '../components/FloatingOrbs';
import PageTransition from '../components/PageTransition';

export default function LandingPage() {
  const stats = [
    { label: 'Claims Processed', value: '50,000+', icon: FileCheck },
    { label: 'Farmers Helped', value: '25,000+', icon: Users },
    { label: 'Amount Disbursed', value: '₹500 Cr+', icon: DollarSign },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Government-backed platform ensuring data security and privacy for all users.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Streamlined workflow reduces claim processing time from weeks to days.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track your claim status at every stage with complete transparency.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated field officers and support team to assist you throughout.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: FileCheck,
      title: 'Easy Documentation',
      description: 'Simple upload process with clear guidelines for required documents.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'Fair Assessment',
      description: 'Multi-level verification ensures accurate and fair compensation.',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <PageTransition initialLoad={true} loadingDuration={2000} message="Welcome to AgriClaim">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <FloatingOrbs />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Wheat className="w-6 h-6 text-white" />
              </div>
              <span className="gradient-text">AgriClaim</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/farmer-login">
                <Button variant="ghost">Farmer Login</Button>
              </Link>
              <Link to="/official-login">
                <Button className="gradient-bg">Official Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-0">
              <Wheat className="w-3 h-3 mr-1" />
              Empowering Farmers Nationwide
            </Badge>
            <h1 className="mb-6">
              Agricultural Loss Claim Management{' '}
              <span className="gradient-text">Made Simple</span>
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Streamlined digital platform for farmers to submit, track, and receive compensation 
              for agricultural losses quickly and transparently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/farmer-register">
                <Button size="lg" className="gradient-bg group">
                  Get Started as Farmer
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/official-login">
                <Button size="lg" variant="outline">
                  Official Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl mb-2 gradient-text">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-0">
              Why Choose AgriClaim
            </Badge>
            <h2 className="mb-4">Comprehensive Support for Farmers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides end-to-end support for agricultural loss claims with 
              transparency, efficiency, and fairness at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 mb-4 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary to-secondary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <CardContent className="p-12 relative z-10">
              <div className="text-center">
                <h2 className="mb-4 text-white">Ready to Submit Your Claim?</h2>
                <p className="mb-8 text-white/90 text-lg">
                  Join thousands of farmers who have received timely compensation for their agricultural losses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/farmer-register">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                      Register Now
                    </Button>
                  </Link>
                  <Link to="/farmer-login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Login to Continue
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
