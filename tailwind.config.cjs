const config = {
    content: ['./src/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#845ec2',
                    dark: '#6036A5',
                    variant: '#E041B0',
                },
            },
            minWidth: {
                '1/3': '33vw',
            },
            minHeight: {
                l: '1.25rem',
            },
        },
    },

    plugins: [],
};

module.exports = config;
