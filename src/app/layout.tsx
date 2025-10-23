import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SwiftFit 215 | Elite Speed & Strength Training | Philadelphia Gym | NFL Trainer Darren Swift",
  description: "Train with NFL player coach Darren Swift at Philadelphia's premier boutique gym. Elite speed & strength training for athletes of all levels. Free consultation - 2245 E Tioga St.",
};

const schemaMarkup = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "name": "SwiftFit 215",
  "alternateName": "Swift Fit Speed and Strength Training Academy",
  "description": "Philadelphia's premier boutique gym specializing in elite speed and strength training. Founded by NFL trainer Darren Swift.",
  "image": "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1761152758760.png",
  "logo": "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1761152758760.png",
  "url": "https://swiftfit215.com",
  "telephone": "+12679390254",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2245 E Tioga Street",
    "addressLocality": "Philadelphia",
    "addressRegion": "PA",
    "postalCode": "19134",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.99123,
    "longitude": -75.11843
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "bestRating": "5",
    "ratingCount": "100"
  },
  "sameAs": [
    "https://www.instagram.com/swiftfit215/",
    "https://www.facebook.com/SwiftFit215/"
  ],
  "founder": {
    "@type": "Person",
    "name": "Darren Swift",
    "jobTitle": "Owner & Head Trainer",
    "description": "NFL player trainer with 20+ years of experience, trained dozens of NFL players and hundreds of college athletes"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Fitness Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Gym Membership",
          "description": "Monthly gym membership with no annual fees, access to state-of-the-art equipment"
        },
        "price": "45",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Personal Training",
          "description": "One-on-one personalized fitness plans with certified trainers"
        },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Athletic Training",
          "description": "Elite speed and strength development for football, basketball, and track athletes"
        },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Wellness Services",
          "description": "Assisted stretch therapy, Mat Pilates, Cryotherapy, and recovery programs"
        },
        "availability": "https://schema.org/InStock"
      }
    ]
  },
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Personal Training",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Group Classes",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Cryotherapy",
      "value": true
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          id="schema-markup"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
          strategy="beforeInteractive"
        />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}