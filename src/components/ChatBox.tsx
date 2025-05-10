import { useEffect, useState, useRef, useCallback } from "react";
import { IoSend } from "react-icons/io5";
import { FaCaretUp } from "react-icons/fa";
import { useSwipeable } from 'react-swipeable';
import { IoClose } from "react-icons/io5";

interface Message {
    text: string,
    sender: 'local' | 'remote'
}

interface ChatBoxProps {
    messages: Message[],
    sendMessage: (e: any) => void;
    messageInput: string;
    setMessageInput: React.Dispatch<React.SetStateAction<string>>;
    switchPerson: () => void;
}

export default function ChatBox({ messages, sendMessage, messageInput, setMessageInput, switchPerson }: ChatBoxProps) {
    const [showMessages, setShowMessages] = useState<boolean>(false);
    const [blink, setBlink] = useState<boolean>(false);
    const prevCountRef = useRef(messages.length);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const firstRender = useRef(true);

    // Improved scroll handler
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      if (containerRef.current && messagesEndRef.current) {
        const container = containerRef.current;
        // Use direct pixel calculation instead of scrollIntoView
        const targetScroll = container.scrollHeight - container.clientHeight;
        
        // Smooth scroll with polyfill for consistent behavior
        container.scrollTo({
          top: targetScroll,
          behavior: window.matchMedia('(prefers-reduced-motion: no-preference)').matches 
            ? behavior 
            : 'auto'
        });
      }
    }, []);


    // Scroll trigger with proper timing
useEffect(() => {
        if (showMessages) {
            // Use small timeout to ensure DOM update
            const timer = setTimeout(() => {
                scrollToBottom('auto'); // Force scroll on mobile open
            }, 50);
            
            return () => clearTimeout(timer);
        }
    }, [showMessages, messages, scrollToBottom]);

    // New message notification
    useEffect(() => {
        const prevCount = prevCountRef.current;
        if (!showMessages && messages.length > prevCount) {
            setBlink(true);
            setTimeout(() => setBlink(false), 3000);
        }
        prevCountRef.current = messages.length;
    }, [messages, showMessages]);

    useEffect(() => {
      if (firstRender.current) {
          firstRender.current = false;
          setTimeout(() => scrollToBottom('auto'), 100);
      }
  }, [scrollToBottom]);

    // Swipe handling
    const swipeHandlers = useSwipeable({
        onSwipedUp: () => !showMessages && setShowMessages(true),
        delta: 50,
        trackTouch: true,
        // preventDefaultTouchmoveEvent: true
    });

    return (
        <div className="md:px-4 flex flex-col justify-end gap-[2px] md:gap-4 h-full relative">
            {/* Mobile toggle */}
            {!showMessages && (
                <div {...swipeHandlers} className="md:hidden">
                    <FaCaretUp
                        onClick={() => setShowMessages(true)}
                        className={`-mb-2 w-full ${blink ? 'intense-blinking' : ''}`}
                        size={38}
                        color="var(--color-main)"
                    />
                </div>
            )}

            {/* Messages container */}
            <div
            ref={containerRef}
            className={`${
                showMessages ? 'flex' : 'hidden'
            } md:flex flex-col gap-2 px-2 py-2 bg-[#28282d] overflow-y-auto`}
            style={{
                height: '34vh',
                maxHeight: '38vh',
                // Add these CSS properties for better scroll handling
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain',
            }}
        >
                {/* Mobile close button */}
                <div className="sticky top-0 md:hidden flex justify-end z-10">
                    <IoClose
                        size={26}
                        className="bg-[var(--color-main)] cursor-pointer"
                        onClick={() => setShowMessages(false)}
                    />
                </div>

                {/* Messages list */}
                {messages.map((message, index) => (
                    <div key={index} className="flex gap-2">
                        <div className={`font-medium whitespace-nowrap ${
                            message.sender === 'local' ? 'text-white' : 'text-[#a185ff]'
                        }`}>
                            {message.sender === 'local' ? 'You >' : 'Alien >'}
                        </div>
                        <p className="break-words text-white">{message.text}</p>
                    </div>
                ))}
<div 
  ref={messagesEndRef} 
  style={{ 
    height: '1px', 
    marginTop: 'auto' // Pushes the element to true bottom
  }} 
  className="md:mb-5"
/>            </div>

            {/* Input area */}
            <div className="flex w-full gap-[2px]">
                <button
                    onClick={switchPerson}
                    className="bg-[var(--color-main)] font-[600] text-[20px] px-4 cursor-pointer hover:brightness-110 transition-all"
                >
                    Skip
                </button>
                <form
                    className="flex w-full gap-[1px]"
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(e);
                        scrollToBottom();
                    }}
                >
                    <input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Messages..."
                        type="text"
                        className="px-2 py-4 w-full outline-none border-0 bg-[#28282d] text-white"
                    />
                    <button
                        type="submit"
                        className="bg-[#28282d] px-4 py-4 cursor-pointer hover:brightness-110 transition-all"
                    >
                        <IoSend size={27} color="var(--color-main)" />
                    </button>
                </form>
            </div>
        </div>
    );
}