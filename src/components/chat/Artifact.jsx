import React, {useEffect, useState, useRef} from 'react';
import { Tab, TabPane } from 'semantic-ui-react';
import '@/css/chat.css';
import Map from "./Map.jsx";
import {initialSearch as search} from "../../helpers/constants.js";

const Artifact = ({isVisible, messages, maps, setMaps, setOpenChat, openChat}) => {
    const [panes, setPanes] = useState([]);
    const [mps, setMps] = useState([]);
    const tabRef = useRef(null);


    useEffect(() => {function updateScrollIndicator() {
        const container = document.querySelector('.horizontal-scroll-container');
        if (container) {
          const tabMenu = container.querySelector('.tab-menu');
          const scrollPercentage = (tabMenu.scrollLeft / (tabMenu.scrollWidth - tabMenu.clientWidth)) * 100;
          container.style.setProperty('--scroll', `${scrollPercentage}%`);
        }
      }
      
      // Add event listeners
      document.querySelector('.tab-menu')?.addEventListener('scroll', updateScrollIndicator);
      window.addEventListener('resize', updateScrollIndicator);
      
      // Call initially
      updateScrollIndicator();
        const handleWheel = (e) => {
          const tabMenu = tabRef.current.querySelector('.tab-menu');
          if (tabMenu) {
            e.preventDefault();
            tabMenu.scrollLeft += e.deltaY;
          }
        };
    
        const tabMenu = tabRef.current.querySelector('.tab-menu');
        if (tabMenu) {
          tabMenu.addEventListener('wheel', handleWheel, { passive: false });
        }
    
        return () => {
          if (tabMenu) {
            tabMenu.removeEventListener('wheel', handleWheel);
          }
        };
      }, []);

    useEffect(() => {
        let p = messages
            .filter(message => message.type === 'ai_map_message')
            .map((message, index) => ({
                menuItem: JSON.stringify(message.value.rq),
                render: () => (
                    <TabPane as='div' key={index} className='flex flex-col' style={{backgroundColor: 'rgb(40, 44, 52)', borderColor: 'rgb(82 82 91)', border: '1px solid rgb(82 82 91)', borderRadius: '5px'}}>
                        <div className='text-white p-4'>{JSON.stringify(message.value.rq)}</div>
                        <Map rq={message.value.rq} search={search} maps={mps} setMaps={setMps} mapid={index}/>
                    </TabPane>
                )
            }));
        setPanes(p);
    }, [messages]);

    return (
        <div 
        id="sui" 
        className={`fixed right-0 px-10 w-full border-zinc-600 rounded-lg`} // Webkit transform creates a new stacking context. Transform must be applied to a child if using position: fixed.
        style={{maxWidth: '50vw', maxHeight: '80vh'}}>
            <div 
            ref={tabRef} 
            className={`flex flex-1 flex-col horizontal-scroll-container w-full 
                        transition-transform duration-200 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'} `}> 
                <Tab
                    menu={{
                        fluid: true,
                        secondary: true,
                        pointing: true,
                        className: 'tab-menu'
                    }}
                    panes={panes}
                    renderActiveOnly={true}
                    style={{display: 'flex', flex: '1', flexDirection: 'column', overflowX: 'hidden', position: 'relative'}}
                    className='tab-component'
                />
                <button onClick={() => setOpenChat(!openChat)}>Close</button>
            </div>
        </div>
    );
}

export default Artifact;
