import React from 'react';

export const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355-.186-.676-.401-.959a1.65 1.65 0 00-2.7 0c-.215.283-.401.604-.401.959c0 .356.186.676.401.959a1.65 1.65 0 002.7 0c.215-.283.401-.604.401-.959z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 10-12 0v1.5a6 6 0 006 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l.343.343m5.814 5.814L15 11.25M4.5 8.25l.343.343m14.814 5.814L20.25 15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v.008" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h.008m16.484 0h.008" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25v.008" />
    </svg>
);
