import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext';

const LIGHT_THEME = 'lara-light-cyan';
const DARK_THEME = 'lara-dark-cyan';

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('theme') || LIGHT_THEME
    );

    useEffect(() => {
        const themeLink = document.getElementById('theme-link');

        if (!themeLink) {
            console.error(
                'No se encontró <link id="theme-link"> en index.html'
            );
            return;
        }

        themeLink.href = `/themes/${theme}/theme.css`;

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) =>
            current === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
        );
    };

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === DARK_THEME,
            setTheme,
            toggleTheme
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
