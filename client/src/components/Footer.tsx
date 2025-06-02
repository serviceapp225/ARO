import { Car } from 'lucide-react';
import { Link } from 'wouter';

export function Footer() {
  const sections = [
    {
      title: 'Marketplace',
      links: [
        { name: 'Browse Cars', href: '/search' },
        { name: 'Sell Your Car', href: '/sell' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Pricing', href: '/pricing' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Safety', href: '/safety' },
        { name: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold">CarAuctionApp</span>
            </div>
            <p className="text-neutral-400">
              The premier destination for automotive auctions and premium vehicle sales.
            </p>
          </div>
          
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-neutral-400">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <span className="text-sm">fb</span>
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <span className="text-sm">tw</span>
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <span className="text-sm">ig</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; 2024 CarAuctionApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
