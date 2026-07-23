'use client';

import React from 'react';
import {
  Storefront,
  Info as PhInfo,
  ChatText,
  SignIn,
  SignOut,
  List,
  X as PhX,
  ShieldCheck as PhShieldCheck,
  House,
  ArrowRight as PhArrowRight,
  ArrowLeft as PhArrowLeft,
  Star as PhStar,
  MapPin as PhMapPin,
  Trophy,
  Phone as PhPhone,
  Envelope,
  Sparkle,
  ShoppingBag as PhShoppingBag,
  SquaresFour,
  Package as PhPackage,
  UserCheck as PhUserCheck,
  Globe as PhGlobe,
  User as PhUser,
  CaretRight,
  Plus as PhPlus,
  PencilSimple,
  Trash as PhTrash,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  PaperPlaneRight,
  Lock as PhLock,
  WarningCircle,
  Camera as PhCamera,
  UploadSimple,
  Image as PhImage,
  Layout as PhLayout,
  Heart as PhHeart,
  Clock as PhClock,
  TrendUp,
  UsersThree,
  ArrowSquareOut,
  MagnifyingGlass,
  Funnel,
  ChatCircle,
  IconProps
} from '@phosphor-icons/react';

// Wrapper helper to convert Lucide-style className ("w-4 h-4") to Phosphor props
const wrap = (Component: React.ComponentType<IconProps>) => {
  return function PhosphorIconWrapper({ className, ...props }: React.SVGProps<SVGSVGElement> & IconProps) {
    return <Component className={className} weight="bold" {...props} />;
  };
};

export const Store = wrap(Storefront);
export const Info = wrap(PhInfo);
export const MessageSquare = wrap(ChatText);
export const LogIn = wrap(SignIn);
export const LogOut = wrap(SignOut);
export const Menu = wrap(List);
export const X = wrap(PhX);
export const ShieldCheck = wrap(PhShieldCheck);
export const Home = wrap(House);
export const ArrowRight = wrap(PhArrowRight);
export const ArrowLeft = wrap(PhArrowLeft);
export const Star = wrap(PhStar);
export const MapPin = wrap(PhMapPin);
export const Award = wrap(Trophy);
export const PhoneCall = wrap(PhPhone);
export const Phone = wrap(PhPhone);
export const Mail = wrap(Envelope);
export const Sparkles = wrap(Sparkle);
export const ShoppingBag = wrap(PhShoppingBag);
export const LayoutDashboard = wrap(SquaresFour);
export const Package = wrap(PhPackage);
export const UserCheck = wrap(PhUserCheck);
export const Globe = wrap(PhGlobe);
export const User = wrap(PhUser);
export const ChevronRight = wrap(CaretRight);
export const Plus = wrap(PhPlus);
export const Edit2 = wrap(PencilSimple);
export const Trash2 = wrap(PhTrash);
export const Check = wrap(PhCheck);
export const CheckCircle2 = wrap(PhCheckCircle);
export const Send = wrap(PaperPlaneRight);
export const Lock = wrap(PhLock);
export const AlertCircle = wrap(WarningCircle);
export const Camera = wrap(PhCamera);
export const Upload = wrap(UploadSimple);
export const ImageIcon = wrap(PhImage);
export const Image = wrap(PhImage);
export const Layout = wrap(PhLayout);
export const Heart = wrap(PhHeart);
export const Clock = wrap(PhClock);
export const TrendingUp = wrap(TrendUp);
export const Users = wrap(UsersThree);
export const ExternalLink = wrap(ArrowSquareOut);
export const Search = wrap(MagnifyingGlass);
export const Filter = wrap(Funnel);
export const MessageCircle = wrap(ChatCircle);
