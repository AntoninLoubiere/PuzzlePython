const config = {
    content: ['./src/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#845ec2',
                    dark: '#6036A5',
                    variant: '#E041B0'
                }
            },
            minWidth: {
                '1/3': '33vw'
            }
        }
    },

    plugins: []
};

module.exports = config;
