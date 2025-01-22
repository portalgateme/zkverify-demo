import { NextPage } from 'next';
import React from 'react';

import { useRouter } from 'next/router';

const HomePage: NextPage = () => {
  const router = useRouter();

  React.useEffect(() => {
    router.push('/depositwithdraw');
  }, []);

  return null;
}

export default HomePage
