import React from 'react';
import { Search } from 'lucide-react';
import '../../index.css';

const HeroSection = () => {
    return (
        <div style={{height: "90vh"}}>
            {/*<div className="absolute inset-0">*/}
            <div className="bg-black bg-center absolute inset-0 w-full object-cover overflow-hidden h-[90vh]">
                {/*<img*/}
                {/*    src="src/assets/gecko-239812_1280-removebg.png"*/}
                {/*    alt="Hero background"*/}
                {/*    className="bg-center absolute inset-0 w-full h-full object-cover opacity-75 "*/}
                {/*    style={{marginTop: '120px', width: "1280px", height: "720px"}}*/}
                {/*/>*/}
                <div className="bg-center w-full h-full bg-black bg-no-repeat opacity-50 h-[90vh]"
                     style={{backgroundImage: `url('src/assets/gecko-239812_1280-removebg.png')`, backgroundSize: '1200px 700px'}}></div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <nav className="bg-black p-4">
                    <div className="container mx-auto flex justify-between items-center">
                        <a href="https://beta-portal.idigbio.org"><img
                            src="https://beta-portal.idigbio.org/portal/img/idigbio_logo.png" alt="iDigBio Logo"
                            style={{height: "50px", marginRight: "10px"}}/></a>
                        <div className="space-x-4">
                            <a href="#" className="text-white hover:text-idb-blue">Home</a>
                            <a href="#" className="text-white hover:text-idb-green">About</a>
                            <a href="#" className="text-white hover:text-idb-orange">Contact</a>
                            <a href="#" className="text-white hover:text-idb-yellow">Login</a>
                        </div>
                    </div>
                </nav>

                <div className="flex-grow flex flex-col justify-center items-center text-center text-white p-4">
                    <h1 className="text-4xl font-bold mb-4">Integrated Digitized Biocollections</h1>
                    <p className="text-xl mb-8">Making millions of biological specimens available on the web</p>
                    <div className="w-full max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search institutions"
                                className="w-full py-2 px-4 pr-10 rounded-full text-gray-900"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Search className="text-gray-500"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/*</div>*/}
        </div>
    );
};

export default HeroSection;